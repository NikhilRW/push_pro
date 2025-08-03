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
  const updateState = Worklets.createRunOnJS((state: string) =>
    setCurrentState(state),
  );
  const incrementCount = Worklets.createRunOnJS(() => {
    setCount(prev => prev + 1);
  });
  const updateLastFaceY = Worklets.createRunOnJS((y: number) =>
    setLastFaceY(y),
  );
  const updateBufferInfo = Worklets.createRunOnJS((info: any) =>
    setBufferInfo(info),
  );
  const resetStateToReady = Worklets.createRunOnJS(() => {
    setTimeout(() => setCurrentState('ready'), 1500);
  });

  return {
    updateState,
    incrementCount,
    updateLastFaceY,
    updateBufferInfo,
    resetStateToReady,
  };
};
