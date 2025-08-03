import { Frame } from 'react-native-vision-camera';
import { Face } from 'react-native-vision-camera-face-detector';

export type FaceDetectorPlugin = {
  detectFaces: (frame: Frame) => Face[];
};
