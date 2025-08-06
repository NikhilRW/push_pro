import { Alert } from 'react-native';
import {
  motivationalMessages,
  PATTERN_CONFIDENCE_THRESHOLD,
} from '../constants';
import RNFS from 'react-native-fs';
import { ELEVENLABS_API_KEY } from '@env';
import Sound from 'react-native-sound';
import { Buffer } from 'buffer';
import { ToWords } from 'to-words';
import { styles } from '../styles/CustomButton';
import { VolumeType } from '../types/PushupCounter';
const toWords = new ToWords();

// PERFORMANCE OPTIMIZED: Pre-allocated arrays and variables
let referenceY: number | null = null;
let lastValidPushupTime = 0;

// Pre-allocated arrays to avoid garbage collection
const tempYValues: number[] = new Array(25);
const tempFaceDetected: boolean[] = new Array(25);

// PERFORMANCE OPTIMIZED: Ultra-fast pattern analysis
export const analyzeBufferPattern = (
  buffer: Array<{ y: number; timestamp: number; faceDetected: boolean }>,
  _videoHeight: number,
) => {
  'worklet';

  // Early exit for insufficient data
  if (buffer.length < 12) {
    return { found: false, confidence: 0, pattern: 'insufficient_data' };
  }

  const bufferLength = buffer.length;

  // PERFORMANCE: Single pass through buffer to collect data
  let faceDetectedCount = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  let lastFaceY = 0;
  let firstFaceY = 0;
  let lastFaceTime = 0;
  let faceGoneCount = 0;

  // Single pass optimization - collect all data in one loop
  for (let i = 0; i < bufferLength; i++) {
    const item = buffer[i];

    if (item.faceDetected) {
      if (faceDetectedCount === 0) {
        firstFaceY = item.y;
      }

      lastFaceY = item.y;
      lastFaceTime = item.timestamp;

      // Track min/max in single pass
      if (item.y < minY) minY = item.y;
      if (item.y > maxY) maxY = item.y;

      faceDetectedCount++;

      // Store for velocity calculation
      tempYValues[faceDetectedCount - 1] = item.y;
      tempFaceDetected[faceDetectedCount - 1] = true;
    } else {
      faceGoneCount++;
    }
  }

  // Early exit if insufficient face data
  if (faceDetectedCount < 5) {
    referenceY = null;
    return { found: false, confidence: 0, pattern: 'insufficient_face_data' };
  }

  // Calculate range
  const range = maxY - minY;

  // Early exit for insufficient movement
  if (range < 50) {
    return {
      found: false,
      confidence: 0,
      pattern: 'insufficient_range',
      minY,
      maxY,
      range,
    };
  }

  // CRITICAL: Check if face was undetected at least once (indicating person went down)
  console.log(faceGoneCount);
  if (faceGoneCount <= 8) {
    return {
      found: false,
      confidence: 0,
      pattern: 'no_face_gone_phase',
      minY,
      maxY,
      range,
      faceGoneCount,
    };
  }

  // PERFORMANCE: Optimized velocity calculation (only if needed)
  let velocityStable = true;
  let recentVelocity = 0;

  if (faceDetectedCount > 1) {
    // Calculate only recent velocities for stability check
    const recentCount = Math.min(3, faceDetectedCount - 1);
    let velocitySum = 0;

    for (let i = faceDetectedCount - recentCount; i < faceDetectedCount; i++) {
      const deltaY = tempYValues[i] - tempYValues[i - 1];
      const deltaTime = buffer[i].timestamp - buffer[i - 1].timestamp;
      const velocity = deltaY / deltaTime;
      velocitySum += Math.abs(velocity);
    }

    recentVelocity = velocitySum / recentCount;
    velocityStable = recentVelocity < 0.1; // Threshold for stability
  }

  // PERFORMANCE: Simplified pattern detection
  const faceGoneRatio = faceGoneCount / bufferLength;
  const hasFaceGonePhase = faceGoneRatio > 0.1; // Reduced to 10% - just need some face gone frames

  // Calculate movement patterns
  const upwardMovement = firstFaceY - minY; // Face goes up (Y decreases)
  const returnMovement = Math.abs(lastFaceY - firstFaceY);

  let confidence = 0;
  let patternType = 'none';

  // CRITICAL: Only count pushups when face was gone (person went down)
  if (faceDetectedCount >= 6) {
    // Pattern: face visible → up → gone → returns
    if (upwardMovement > 15 && returnMovement < 25) {
      confidence = Math.min(
        0.95,
        (upwardMovement + (hasFaceGonePhase ? 20 : 0)) / 40,
      );
      patternType = 'up_gone_return';
    }
  }

  // REMOVED: Simple up-down pattern without face gone phase
  // This prevents counting head movements as pushups

  // PERFORMANCE: Optimized reference position management
  const currentY = lastFaceY;
  const currentTime = lastFaceTime;

  // Initialize reference if needed
  if (referenceY === null && confidence < PATTERN_CONFIDENCE_THRESHOLD) {
    if (faceDetectedCount >= 5 && velocityStable) {
      referenceY = currentY;
      return { found: false, confidence: 0, pattern: 'reference_set' };
    }
  }

  // Validate against reference position
  if (referenceY !== null && confidence >= PATTERN_CONFIDENCE_THRESHOLD) {
    const returnToStart = Math.abs(currentY - referenceY) < 30;
    const sufficientTimePassed = currentTime - lastValidPushupTime > 150; // Reduced to 150ms

    if (returnToStart && sufficientTimePassed) {
      lastValidPushupTime = currentTime;
      return {
        found: true,
        confidence: confidence * (velocityStable ? 1.1 : 1.0),
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
    faceGoneRatio,
  };
};

export const speakUsingElevenLabs = (
  count: number,
  whenLastMessageIncluded: React.RefObject<{
    lastCount: number;
  }>,
  isMotivationPlaying: boolean,
  volume: VolumeType,
): (() => Promise<{ sound: Sound; motivation: boolean } | null>) => {
  // This function returns a Promise that resolves to either an object with sound and motivation, or null.
  // It should never return 'void' to match the expected type.

  return async () => {
    const differenceInCount = count - whenLastMessageIncluded.current.lastCount;
    const isMessageShouldBeIncluded =
      differenceInCount >= 5 && differenceInCount <= 10;
    try {
      if (count > 40) {
        let message = '';
        let isMotivation = false;
        if (
          (volume === 'high' &&
            isMessageShouldBeIncluded &&
            Math.floor(Math.random() * 10 + 5) === differenceInCount) ||
          differenceInCount === 10
        ) {
          whenLastMessageIncluded.current.lastCount = count;
          message =
            `${toWords.convert(count)} ` +
            motivationalMessages[
              Math.floor(Math.random() * motivationalMessages.length)
            ];
          isMotivation = true;
        } else {
          message = `${toWords.convert(count)}`;
          isMotivation = false;
        }
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
              text: message,
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
        const path = RNFS.DocumentDirectoryPath + '/tts_audio.mp3';
        const dirPath = RNFS.DocumentDirectoryPath;
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
        await RNFS.writeFile(path, buffer.toString('base64'), 'base64');
        const sound = new Sound(path, '', error => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          if (!isMotivationPlaying) {
            sound.play();
          }
        });
        return { sound: sound, motivation: isMotivation };
      } else {
        if (
          (volume === 'high' &&
            isMessageShouldBeIncluded &&
            Math.floor(Math.random() * 5 + 1) === differenceInCount) ||
          differenceInCount === 5
        ) {
          whenLastMessageIncluded.current.lastCount = count;
          const newSound = new Sound(
            'message' + Math.floor(Math.random() * motivationalMessages.length),
            Sound.MAIN_BUNDLE,
            error_2 => {
              if (error_2) {
                console.log('Failed to load the sound', error_2);
                return;
              }
              newSound.play();
            },
          );
          return { sound: newSound, motivation: true };
        } else {
          const sound = new Sound('audio' + count, Sound.MAIN_BUNDLE, error => {
            if (error) {
              console.log('Failed to load the sound', error);
              return;
            }
            if (!isMotivationPlaying) {
              sound.play();
            }
          });
          return { sound: sound, motivation: false };
        }
      }
    } catch (err) {
      console.error('TTS speakText error', err);
      Alert.alert('Error', 'Something went wrong during TTS');
      return null;
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
    case 'no_face_gone_phase':
      return '#FF5722'; // Deep orange - need face gone phase
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
    case 'no_face_gone_phase':
      return 'Need Face Gone Phase';
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
export const getButtonStyle = (
  buttonVariant: 'primary' | 'secondary' | 'danger',
  disabled: boolean,
) => {
  const variantStyle =
    `button${buttonVariant[0].toUpperCase() + buttonVariant.slice(1)}` as
      | 'buttonPrimary'
      | 'buttonSecondary'
      | 'buttonDanger';
  return [
    styles.buttonBase,
    styles[variantStyle],
    disabled && styles.buttonDisabled,
  ];
};
