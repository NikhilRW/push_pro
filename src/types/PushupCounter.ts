import { Frame } from 'react-native-vision-camera';
import { Face } from 'react-native-vision-camera-face-detector';

export type FaceDetectorPlugin = {
  detectFaces: (frame: Frame) => Face[];
};

export type VolumeType = 'low' | 'high' | 'mute';
export type SetVolumeType = React.Dispatch<
  React.SetStateAction<'low' | 'high' | 'mute'>
>;

export type ButtonVariantsType =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning';

export type VolumeIconType = 'volume-up' | 'volume-off' | 'volume-down';
