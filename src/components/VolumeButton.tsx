import { TouchableOpacity } from 'react-native';
import React, { memo, useCallback } from 'react';
import { getButtonStyle } from '../utils';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HapticFeedbackOptions } from '../constants';
import { ButtonVariantsType } from '../types/PushupCounter';

export const VolumeButton = memo(
  ({
    onPress,
    disabled = false,
    children,
    variant,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    children?: React.JSX.Element;
    variant: ButtonVariantsType;
  }) => {
    const onPressMemoized = useCallback(() => {
      onPress();
      ReactNativeHapticFeedback.trigger('effectTick', HapticFeedbackOptions);
    }, [onPress]);

    return (
      <TouchableOpacity
        onPress={onPressMemoized}
        style={getButtonStyle(variant, disabled)}
        activeOpacity={0.8}
        className="justify-center items-center"
      >
        {children}
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.title === next.title &&
      prev.children?.props.name === next.children?.props.name
    );
  },
);
