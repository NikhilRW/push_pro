import { Worklets } from 'react-native-worklets-core';

export const usePushupSharedVals = () => {
  // PERFORMANCE: Pre-allocate buffer with optimal size
  const faceYBuffer = Worklets.createSharedValue<
    Array<{ y: number; timestamp: number; faceDetected: boolean }>
  >([]);

  // PERFORMANCE: Optimized shared values for minimal overhead
  const bufferIndex = Worklets.createSharedValue(0);
  const lastAnalysisTime = Worklets.createSharedValue(0);
  const lastFaceDisappearedTime = Worklets.createSharedValue(0);

  // PERFORMANCE: Add performance monitoring
  const frameCount = Worklets.createSharedValue(0);
  const lastFrameTime = Worklets.createSharedValue(0);

  return {
    faceYBuffer,
    bufferIndex,
    lastAnalysisTime,
    lastFaceDisappearedTime,
    frameCount,
    lastFrameTime,
  };
};
