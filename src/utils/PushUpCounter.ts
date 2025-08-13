import { CameraDeviceFormat } from 'react-native-vision-camera';
import { PATTERN_CONFIDENCE_THRESHOLD } from '../constants';

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
  // console.log(faceGoneCount);
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

export const findVideoFormat = (f: CameraDeviceFormat) =>
  f.videoWidth <= 640 && f.videoHeight <= 480;
