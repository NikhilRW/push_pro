import { ISharedValue } from 'react-native-worklets-core';
import { FaceDetectorPlugin } from './PushupCounter';

export type usePushupFrameProcessorParamsType = {
  faceDetector: FaceDetectorPlugin;
  isActive: boolean;
  updateLastFaceY: (y: number) => Promise<void>;
  lastFaceDisappearedTime: ISharedValue<number>;
  faceYBuffer: ISharedValue<
    {
      y: number;
      timestamp: number;
      faceDetected: boolean;
    }[]
  >;
  lastAnalysisTime: ISharedValue<number>;
  updateState: (state: string) => Promise<void>;
  updateBufferInfo: (info: any) => Promise<void>;
  incrementCount: () => Promise<void>;
  resetStateToReady: () => Promise<void>;
  videoHeight:number;
};
