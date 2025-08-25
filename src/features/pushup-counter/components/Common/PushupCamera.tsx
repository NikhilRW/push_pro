import { View } from 'react-native';
import React from 'react';
import {
  CameraDevice,
  CameraDeviceFormat,
  DrawableFrameProcessor,
  ReadonlyFrameProcessor,
  Camera,
} from 'react-native-vision-camera';
import { useThemedStyles } from 'pushup-counter/styles/PushUpCounter';

const PushupCamera = ({
  deviceFormat,
  frameProcessor,
  isActive,
  device,
}: {
  device: CameraDevice;
  isActive: boolean;
  frameProcessor: ReadonlyFrameProcessor | DrawableFrameProcessor | undefined;
  deviceFormat: CameraDeviceFormat;
}) => {
  const styles = useThemedStyles();
  return (
    <View style={styles.hiddenCamera}>
      <Camera
        style={styles.hiddenCamera}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        fps={15}
        format={deviceFormat}
      />
    </View>
  );
};

export default PushupCamera;
