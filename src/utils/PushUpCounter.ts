import { Alert } from 'react-native';
import { MIN_MOVEMENT_RANGE, PATTERN_CONFIDENCE_THRESHOLD } from '../constants';
import RNFS from 'react-native-fs';
import { ELEVENLABS_API_KEY, VOICE_ID1 } from '@env';
import React from 'react';
import Sound from 'react-native-sound';
import { Buffer } from 'buffer';
import { getVoiceFile } from '../../legacy/Voice';
import { ToWords } from 'to-words';
const toWords = new ToWords();

// Track reference position for push-up starting point
let referenceY: number | null = null;
let lastValidPushupTime = 0;

export // Function to analyze buffer for pushup pattern (pure worklet function)
const analyzeBufferPattern = (
  buffer: Array<{ y: number; timestamp: number; faceDetected: boolean }>,
) => {
  'worklet';

  if (buffer.length < 15)
    return { found: false, confidence: 0, pattern: 'insufficient_data' };

  // Separate face detected and face gone periods
  const faceDetectedEntries = buffer.filter(item => item.faceDetected);
  const faceGoneEntries = buffer.filter(item => !item.faceDetected);

  // Calculate velocities between consecutive frames
  const velocities = [];
  for (let i = 1; i < faceDetectedEntries.length; i++) {
    const deltaY = faceDetectedEntries[i].y - faceDetectedEntries[i - 1].y;
    const deltaTime =
      faceDetectedEntries[i].timestamp - faceDetectedEntries[i - 1].timestamp;
    velocities.push(deltaY / deltaTime); // pixels per millisecond
  }

  // Need some face detection data
  if (faceDetectedEntries.length < 6) {
    // Reduced minimum required frames
    referenceY = null; // Reset reference when insufficient data
    return { found: false, confidence: 0, pattern: 'insufficient_face_data' };
  }

  // Get Y values for analysis (only from detected faces)
  const yValues = faceDetectedEntries.map(item => item.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY;

  // Need sufficient movement range
  if (range < MIN_MOVEMENT_RANGE) {
    return {
      found: false,
      confidence: 0,
      pattern: 'insufficient_range',
      minY,
      maxY,
      range,
    };
  }

  // Analyze the complete buffer timeline for pattern: face_visible → face_up → face_gone → face_reappears
  const bufferLength = buffer.length;
  const firstQuarter = buffer.slice(0, Math.floor(bufferLength / 4));
  const secondQuarter = buffer.slice(
    Math.floor(bufferLength / 4),
    Math.floor(bufferLength / 2),
  );
  const thirdQuarter = buffer.slice(
    Math.floor(bufferLength / 2),
    Math.floor((3 * bufferLength) / 4),
  );
  const fourthQuarter = buffer.slice(Math.floor((3 * bufferLength) / 4));

  // Calculate average Y for each quarter (only for detected faces)
  const getQuarterAvgY = (
    quarter: Array<{ y: number; timestamp: number; faceDetected: boolean }>,
  ) => {
    const detectedFaces = quarter.filter(item => item.faceDetected);
    if (detectedFaces.length === 0) return null;
    return (
      detectedFaces.reduce((sum, item) => sum + item.y, 0) /
      detectedFaces.length
    );
  };

  const getFaceDetectionRatio = (
    quarter: Array<{ y: number; timestamp: number; faceDetected: boolean }>,
  ) => {
    return quarter.filter(item => item.faceDetected).length / quarter.length;
  };

  const q1AvgY = getQuarterAvgY(firstQuarter);
  const q2AvgY = getQuarterAvgY(secondQuarter);
  const q3AvgY = getQuarterAvgY(thirdQuarter);
  const q4AvgY = getQuarterAvgY(fourthQuarter);

  const q1FaceRatio = getFaceDetectionRatio(firstQuarter);
  const q2FaceRatio = getFaceDetectionRatio(secondQuarter);
  const q3FaceRatio = getFaceDetectionRatio(thirdQuarter);
  const q4FaceRatio = getFaceDetectionRatio(fourthQuarter);

  let confidence = 0;
  let patternType = 'none';

  // Look for pushup pattern:
  // Q1: Face visible (center)
  // Q2: Face moves up (Y decreases)
  // Q3: Face gone (down phase) - low face detection ratio
  // Q4: Face returns (Y increases back to center)

  if (q1AvgY !== null && q2AvgY !== null && q4AvgY !== null) {
    // Check for face disappearance in middle quarters
    const hasFaceGonePhase = q2FaceRatio < 0.5 || q3FaceRatio < 0.5;

    if (hasFaceGonePhase && q1FaceRatio > 0.7 && q4FaceRatio > 0.7) {
      // Pattern: visible → up/gone → reappears
      const upwardMovement = q1AvgY - q2AvgY; // Face goes UP (Y decreases)
      const returnMovement = Math.abs(q4AvgY - q1AvgY); // Face returns to similar position

      // Check if face went up and then returned
      if (upwardMovement > 10 && returnMovement < 30) {
        // Return should be close to start
        confidence = Math.min(
          0.95,
          (upwardMovement + (hasFaceGonePhase ? 20 : 0)) / 50,
        );
        patternType = 'up_gone_return';
        console.log(
          `Pushup pattern: Up movement: ${upwardMovement.toFixed(
            1,
          )}px, Face gone phase: ${hasFaceGonePhase}, Return diff: ${returnMovement.toFixed(
            1,
          )}px`,
        );
      }
    }

    // Also check for simple up-down pattern without face loss
    else if (
      q1AvgY !== null &&
      q2AvgY !== null &&
      q3AvgY !== null &&
      q4AvgY !== null
    ) {
      if (q1AvgY > q2AvgY && q2AvgY < q3AvgY && q3AvgY > q4AvgY) {
        const upwardMovement = q1AvgY - q2AvgY; // Face goes UP (Y decreases)
        const downwardMovement = q3AvgY - q4AvgY; // Face comes DOWN (Y increases)

        if (upwardMovement > 15 && downwardMovement > 15) {
          confidence = Math.min(0.9, (upwardMovement + downwardMovement) / 60);
          patternType = 'up_down_up';
          console.log(
            `Simple pattern: Up movement: ${upwardMovement.toFixed(
              1,
            )}px, Down movement: ${downwardMovement.toFixed(1)}px`,
          );
        }
      }
    }
  }

  // Update or establish reference position with velocity validation
  const currentY = faceDetectedEntries[faceDetectedEntries.length - 1].y;
  const currentTime =
    faceDetectedEntries[faceDetectedEntries.length - 1].timestamp;

  // Calculate velocity stability
  const recentVelocities = velocities.slice(-3);
  const isStable = recentVelocities.every(v => Math.abs(v) < 0.05); // Less than 0.05 pixels/ms

  // Initialize reference position if not set
  if (referenceY === null && confidence < PATTERN_CONFIDENCE_THRESHOLD) {
    if (q1FaceRatio > 0.8 && isStable) {
      // Reduced face ratio requirement
      referenceY = currentY;
      return { found: false, confidence: 0, pattern: 'reference_set' };
    }
  }

  // Validate against reference position with velocity consideration
  if (referenceY !== null && confidence >= PATTERN_CONFIDENCE_THRESHOLD) {
    const returnToStart = Math.abs(currentY - referenceY) < 25; // Increased tolerance
    const sufficientTimePassed = currentTime - lastValidPushupTime > 800; // Reduced to 0.8s

    // Check if movement has stabilized
    const hasStabilized =
      isStable || Math.abs(velocities[velocities.length - 1]) < 0.1;

    if (returnToStart && sufficientTimePassed && hasStabilized) {
      lastValidPushupTime = currentTime;
      return {
        found: true,
        confidence: confidence * (isStable ? 1.1 : 1.0), // Boost confidence for stable form
        pattern: patternType,
        minY,
        maxY,
        range,
        referenceY,
      };
    } else {
      return {
        found: false,
        confidence: 0,
        pattern: 'invalid_return_position',
      };
    }
  }

  return {
    found: confidence >= PATTERN_CONFIDENCE_THRESHOLD,
    confidence,
    pattern: patternType,
    minY,
    maxY,
    range,
    faceGoneRatio: faceGoneEntries.length / buffer.length,
    quarters: { q1FaceRatio, q2FaceRatio, q3FaceRatio, q4FaceRatio },
  };
};

export const speakUsingElevenLabs = (
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>,
  count: number,
) => {
  return async () => {
    if (!VOICE_ID1) return Alert.alert('Error', 'Voice ID is missing');
    setIsSpeaking(true);
    try {
      if (count > 25) {
        const response = await fetch(
          `https://api.elevenlabs.io//v1/text-to-speech/ZthjuvLPty3kTMaNKVKb?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              Accept: 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: `${toWords.convert(count)}`,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
              },
            }),
          },
        );
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = RNFS.DownloadDirectoryPath + '/tts_audio.mp3';
        await RNFS.writeFile(path, buffer.toString('base64'), 'base64');
        const sound = new Sound(path, '', error => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          sound.play();
        });
      } else {
        const sound = new Sound('audio' + count, Sound.MAIN_BUNDLE, error => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          sound.play();
        });
      }
    } catch (err) {
      console.error('TTS speakText error', err);

      Alert.alert('Error', 'Something went wrong during TTS');
    } finally {
      setIsSpeaking(false);
    }
  };
};

export const getStateColor = (state: string) => {
  switch (state) {
    case 'tracking':
      return '#2196F3'; // Blue - actively tracking
    case 'face_gone_down_phase':
      return '#FF9800'; // Orange - face gone (down phase)
    case 'pattern_found':
      return '#4CAF50'; // Green - pattern detected
    case 'counted':
      return '#4CAF50'; // Green - just counted
    default:
      return '#666'; // Gray - ready
  }
};

export const getStateText = (state: string) => {
  switch (state) {
    case 'tracking':
      return 'Tracking';
    case 'face_gone_down_phase':
      return 'Down Phase';
    case 'pattern_found':
      return 'Pattern Found!';
    case 'counted':
      return 'Counted!';
    default:
      return 'Ready';
  }
};

export const getPatternColor = (pattern: string) => {
  switch (pattern) {
    case 'up_gone_return':
      return '#4CAF50'; // Green - face gone pattern (most accurate)
    case 'up_down_up':
      return '#8BC34A'; // Light green - simple up-down pattern
    case 'insufficient_range':
      return '#FF9800'; // Orange - not enough movement
    case 'insufficient_data':
    case 'insufficient_face_data':
      return '#2196F3'; // Blue - building buffer
    case 'face_lost':
      return '#F44336'; // Red - face lost too long
    default:
      return '#666'; // Gray - analyzing
  }
};

export const getPatternText = (pattern: string) => {
  switch (pattern) {
    case 'reference_set':
      return 'Start Position Set';
    case 'invalid_return_position':
      return 'Return to Start';
    case 'up_gone_return':
      return 'Up→Gone→Return';
    case 'up_down_up':
      return 'Up→Down→Up';
    case 'insufficient_range':
      return 'Small Movement';
    case 'insufficient_data':
      return 'Building Buffer';
    case 'insufficient_face_data':
      return 'Need More Face Data';
    case 'face_lost':
      return 'Face Lost';
    default:
      return 'Analyzing';
  }
};

export function _arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function _base64ToArrayBuffer(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const VOICE_CACHE = new Map();
export async function getVoiceData(voice: string) {
  if (VOICE_CACHE.has(voice)) {
    return VOICE_CACHE.get(voice);
  }

  const buffer = new Float32Array(await getVoiceFile(voice));
  VOICE_CACHE.set(voice, buffer);
  return buffer;
}
export const newGetStateColor = (currentSta: string) => {
  switch (currentSta) {
    case 'ready':
      return '#10B981';
    case 'down':
      return '#F59E0B';
    case 'up':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export const newGetStateText = (currentSta: string) => {
  switch (currentSta) {
    case 'ready':
      return 'Ready to Start';
    case 'down':
      return 'Going Down';
    case 'up':
      return 'Push Up!';
    default:
      return 'Waiting...';
  }
};
