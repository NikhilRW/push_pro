import { Worklets } from 'react-native-worklets-core';

export const useWorkletJsFuncs = ({
  setBufferInfo,
  setCount,
  setCurrentState,
  setLastFaceY,
}: {
  setCurrentState: (value: React.SetStateAction<string>) => void;
  setCount: (value: React.SetStateAction<number>) => void;
  setLastFaceY: (value: React.SetStateAction<number>) => void;
  setBufferInfo: (
    value: React.SetStateAction<{
      bufferSize: number;
      currentPattern: string;
      minY: number;
      maxY: number;
      range: number;
    }>,
  ) => void;
}) => {
  // PERFORMANCE: Optimized worklet functions with minimal JS bridge overhead

  const updateState = Worklets.createRunOnJS((state: string) => {
    setCurrentState(state);
  });

  const incrementCount = Worklets.createRunOnJS(() => {
    setCount(prev => prev + 1);
  });

  const updateLastFaceY = Worklets.createRunOnJS((y: number) => {
    setLastFaceY(y);
  });

  const updateBufferInfo = Worklets.createRunOnJS((info: any) => {
    setBufferInfo(info);
  });

  // PERFORMANCE: Optimized reset with shorter timeout for faster response
  const resetStateToReady = Worklets.createRunOnJS(() => {
    setTimeout(() => setCurrentState('ready'), 800); // Reduced from 1500ms
  });

  return {
    updateState,
    incrementCount,
    updateLastFaceY,
    updateBufferInfo,
    resetStateToReady,
  };
};
