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
}: usePushupFrameProcessorParamsType) => {
  return useFrameProcessor(
    frame => {
      'worklet';

      if (!isActive) return;

      const faces = faceDetector.detectFaces(frame);
      const now = Date.now();


      if (faces.length > 0) {
        // Face detected
        const face = faces[0];
        const faceY = face.bounds.y + face.bounds.height / 2;

        updateLastFaceY(faceY);
        lastFaceDisappearedTime.value = 0; // Reset face gone timer

        // Add to shared buffer with face detection flag
        const currentBuffer = faceYBuffer.value;
        const newBuffer = [
          ...currentBuffer,
          { y: faceY, timestamp: now, faceDetected: true },
        ];

        // Maintain buffer size
        if (newBuffer.length > BUFFER_SIZE) {
          newBuffer.shift();
        }

        faceYBuffer.value = newBuffer;
        updateState('trackingz');

        // Throttle pattern analysis
        if (
          now - lastAnalysisTime.value > ANALYSIS_INTERVAL &&
          newBuffer.length >= 15
        ) {
          lastAnalysisTime.value = now;

          const analysis = analyzeBufferPattern(newBuffer);

          updateBufferInfo({
            bufferSize: newBuffer.length,
            currentPattern: analysis.pattern,
            minY: analysis.minY || 0,
            maxY: analysis.maxY || 0,
            range: analysis.range || 0,
          });

          if (analysis.found) {
            console.log(
              `PUSHUP PATTERN DETECTED! Type: ${
                analysis.pattern
              }, Confidence: ${analysis.confidence.toFixed(2)}, Range: ${
                analysis.range?.toFixed(1) || 0
              }px`,
            );

            incrementCount();
            updateState('pattern_found');

            // Clear shared buffer to prevent double counting
            faceYBuffer.value = [];

            // Brief visual feedback
            resetStateToReady();
          }
        }
      } else {
        // No face detected - this could be the "down" phase of pushup
        if (lastFaceDisappearedTime.value === 0) {
          lastFaceDisappearedTime.value = now;
        }

        const timeSinceFaceGone = now - lastFaceDisappearedTime.value;

        // Add "no face" entries to buffer for short periods (this represents the down phase)
        if (timeSinceFaceGone < MAX_FACE_GONE_TIME) {
          const currentBuffer = faceYBuffer.value;

          // Add placeholder entry for missing face (use last known Y position)
          const lastFaceY =
            currentBuffer.length > 0
              ? currentBuffer[currentBuffer.length - 1].y
              : 0;

          const newBuffer = [
            ...currentBuffer,
            {
              y: lastFaceY, // Keep last known position as reference
              timestamp: now,
              faceDetected: false,
            },
          ];

          // Maintain buffer sie
          if (newBuffer.length > BUFFER_SIZE) {
            newBuffer.shift();
          }

          faceYBuffer.value = newBuffer;
          updateState('face_gone_down_phase');

          // Continue pattern analysis even without face
          if (
            now - lastAnalysisTime.value > ANALYSIS_INTERVAL &&
            newBuffer.length >= 15
          ) {
            lastAnalysisTime.value = now;

            const analysis = analyzeBufferPattern(newBuffer);

            updateBufferInfo({
              bufferSize: newBuffer.length,
              currentPattern: analysis.pattern,
              minY: analysis.minY || 0,
              maxY: analysis.maxY || 0,
              range: analysis.range || 0,
            });

            if (analysis.found) {
              console.log(
                `PUSHUP WITH FACE GONE DETECTED! Type: ${
                  analysis.pattern
                }, Confidence: ${analysis.confidence.toFixed(2)}`,
              );

              incrementCount();
              updateState('pattern_found');

              // Clear shared buffer
              faceYBuffer.value = [];
              lastFaceDisappearedTime.value = 0;

              // Brief visual feedback
              resetStateToReady();
            }
          }
        } else {
          // Face gone too long - reset
          console.log('Face lost for too long - clearing buffer');
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
        }
      }
    },
    [faceDetector, isActive],
  );
};
