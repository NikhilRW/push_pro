import { View } from 'react-native';
import React, { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HapticFeedbackOptions } from '../constants';
import { VolumeIconType } from '../types/PushupCounter';
import NeuromorphicButton from './NeuromorphicButton';

export const VolumeButton = ({
  onPress,
  volumeIconName,
}: {
  onPress: () => void;
  volumeIconName: VolumeIconType;
}) => {
  const onPressMemoized = useCallback(() => {
    onPress();
    ReactNativeHapticFeedback.trigger('effectTick', HapticFeedbackOptions);
  }, [onPress]);
  let svgSource = null;
  if (volumeIconName === 'volume-down') {
    svgSource = require('../res/svgs/volume-down.svg');
  } else if (volumeIconName === 'volume-off') {
    svgSource = require('../res/svgs/volume-off.svg');
  } else {
    svgSource = require('../res/svgs/volume-up.svg');
  }
  const height = 80;
  const width = 90;
  return (
    <View className="pt-2" style={{ height, width }}>
      <NeuromorphicButton
        baseColor="#D5B60A"
        height={height}
        width={width}
        onPress={onPress}
        svgSource={svgSource}
        isVolumeUp={volumeIconName==="volume-up"}
        // svgSize={{height:100,width:100}}
      />
    </View>
  );
};
