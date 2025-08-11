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

    return (
      <View className="flex-1 pt-2">
        <NeuromorphicButton
          baseColor={theme.baseColor}
          borderColor={theme.borderColor}
          height={80}
          width={90}
          onPress={onPressMemoized}
          svgSource={svgSource}
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
