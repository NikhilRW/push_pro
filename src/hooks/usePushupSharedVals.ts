import { Worklets } from 'react-native-worklets-core';

export const usePushupSharedVals = () => {
  const faceYBuffer = Worklets.createSharedValue<
    Array<{ y: number; timestamp: number; faceDetected: boolean }>
  >([]);
  const bufferIndex = Worklets.createSharedValue(0);
  const lastAnalysisTime = Worklets.createSharedValue(0);
  const lastFaceDisappearedTime = Worklets.createSharedValue(0);
  return {
    faceYBuffer,
    bufferIndex,
    lastAnalysisTime,
    lastFaceDisappearedTime,
  };
};
