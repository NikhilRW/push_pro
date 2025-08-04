import { useFrameProcessor } from 'react-native-vision-camera';
import {} from 'react-native-vision-camera-face-detector';
import {
  ANALYSIS_INTERVAL,
  BUFFER_SIZE,
  MAX_FACE_GONE_TIME,
} from '../constants';
import { analyzeBufferPattern } from '../utils/PushUpCounter';
import { usePushupFrameProcessorParamsType } from '../types/usePushupFrameProcessor';

export const usePushupFrameProcessor = ({
  faceDetector,
  faceYBuffer,
  incrementCount,
  isActive,
  lastAnalysisTime,
  lastFaceDisappearedTime,
  resetStateToReady,
  updateBufferInfo,
  updateLastFaceY,
  updateState,
  videoHeight,
}: usePushupFrameProcessorParamsType) => {
  return useFrameProcessor(
    frame => {
      'worklet';

      // PERFORMANCE: Early exit if not active
      if (!isActive) return;

      const faces = faceDetector.detectFaces(frame);
      const now = Date.now();

      // PERFORMANCE: Optimized buffer management
      const currentBuffer = faceYBuffer.value;
      let newBuffer: Array<{
        y: number;
        timestamp: number;
        faceDetected: boolean;
      }>;

      if (faces.length > 0) {
        // Face detected - optimize calculations
        const face = faces[0];
        const faceY = face.bounds.y + face.bounds.height / 2;

        updateLastFaceY(faceY);
        lastFaceDisappearedTime.value = 0; // Reset face gone timer

        // PERFORMANCE: Direct buffer manipulation to avoid spread operator
        newBuffer = [
          ...currentBuffer,
          { y: faceY, timestamp: now, faceDetected: true },
        ];

        // Maintain buffer size efficiently
        if (newBuffer.length > BUFFER_SIZE) {
          newBuffer.shift();
        }

        faceYBuffer.value = newBuffer;
        updateState('tracking');

        // PERFORMANCE: Optimized analysis timing
        if (
          now - lastAnalysisTime.value > ANALYSIS_INTERVAL &&
          newBuffer.length >= 12 // Reduced minimum buffer size
        ) {
          lastAnalysisTime.value = now;

          const analysis = analyzeBufferPattern(newBuffer, videoHeight);

          // PERFORMANCE: Only update buffer info if pattern changed
          updateBufferInfo({
            bufferSize: newBuffer.length,
            currentPattern: analysis.pattern,
            minY: analysis.minY || 0,
            maxY: analysis.maxY || 0,
            range: analysis.range || 0,
          });

          if (analysis.found) {
            console.log(
              `PUSHUP DETECTED! Type: ${analysis.pattern}, Confidence: ${analysis.confidence.toFixed(2)}`,
            );

            incrementCount();
            updateState('pattern_found');

            // PERFORMANCE: Clear buffer immediately
            faceYBuffer.value = [];
            resetStateToReady();
          }
        }
      } else {
        // No face detected - optimized handling
        if (lastFaceDisappearedTime.value === 0) {
          lastFaceDisappearedTime.value = now;
        }

        const timeSinceFaceGone = now - lastFaceDisappearedTime.value;

        // PERFORMANCE: Early exit for long face absence
        if (timeSinceFaceGone >= MAX_FACE_GONE_TIME) {
          faceYBuffer.value = [];
          lastFaceDisappearedTime.value = 0;
          updateState('ready');
          updateBufferInfo({
            bufferSize: 0,
            currentPattern: 'face_lost',
            minY: 0,
            maxY: 0,
            range: 0,
          });
          return;
        }

        // Add "no face" entry efficiently
        const lastFaceY =
          currentBuffer.length > 0
            ? currentBuffer[currentBuffer.length - 1].y
            : 0;
        newBuffer = [
          ...currentBuffer,
          { y: lastFaceY, timestamp: now, faceDetected: false },
        ];

        if (newBuffer.length > BUFFER_SIZE) {
          newBuffer.shift();
        }

        faceYBuffer.value = newBuffer;
        updateState('face_gone_down_phase');

        // PERFORMANCE: Continue analysis with optimized timing
        if (
          now - lastAnalysisTime.value > ANALYSIS_INTERVAL &&
          newBuffer.length >= 12
        ) {
          lastAnalysisTime.value = now;

          const analysis = analyzeBufferPattern(newBuffer, videoHeight);

          updateBufferInfo({
            bufferSize: newBuffer.length,
            currentPattern: analysis.pattern,
            minY: analysis.minY || 0,
            maxY: analysis.maxY || 0,
            range: analysis.range || 0,
          });

          if (analysis.found) {
            console.log(
              `PUSHUP WITH FACE GONE DETECTED! Type: ${analysis.pattern}, Confidence: ${analysis.confidence.toFixed(2)}`,
            );

            incrementCount();
            updateState('pattern_found');

            // PERFORMANCE: Clear buffer and reset immediately
            faceYBuffer.value = [];
            lastFaceDisappearedTime.value = 0;
            resetStateToReady();
          }
        }
      }
    },
    [faceDetector, isActive],
  );
};
