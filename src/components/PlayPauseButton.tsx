import { View } from 'react-native';
import React, { memo, useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HapticFeedbackOptions } from '../constants';
import NeuromorphicButton from './NeuromorphicButton';

export const PlayPauseButton = memo(
  ({
    onPress,
    variant = 'primary',
  }: {
    variant: 'primary' | 'secondary' | 'danger';
    onPress: () => void;
    disabled?: boolean;
    children?: React.JSX.Element;
  }) => {
    const onPressMemoized = useCallback(() => {
      onPress();
      ReactNativeHapticFeedback.trigger('effectTick', HapticFeedbackOptions);
    }, [onPress]);

    const isActive = variant === 'danger';
    const svgSource = isActive
      ? require('../res/svgs/pause.svg')
      : require('../res/svgs/play.svg');

    const theme = {
      baseColor: isActive ? '#EF4444' : '#3B82F6',
      borderColor: isActive ? '#EF4444' : '#3B82F6',
    };
    const height = 80;
    const width = 90;
    return (
      <View className="pt-2" style={{height,width}}>
        <NeuromorphicButton
          baseColor={theme.baseColor}
          height={height}
          width={width}
          onPress={onPressMemoized}
          svgSource={svgSource}
          svgSize={{height:75,width:100}}
        />
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.children?.props.name === next.children?.props.name &&
      prev.variant === next.variant
    );
  },
);
