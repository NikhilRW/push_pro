import { Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/CustomButton';
import React, { memo, useCallback } from 'react';
import { getButtonStyle } from '../utils/PushUpCounter';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const CustomButton = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    children,
  }: {
    title: string;
    variant: 'primary' | 'secondary' | 'danger';
    onPress: () => void;
    disabled?: boolean;
    children?: React.JSX.Element;
  }) => {
    const getTextStyle = () => [
      styles.textBase,
      disabled && styles.textDisabled,
    ];

    const onPressMemoized = useCallback(() => {
      onPress();
      ReactNativeHapticFeedback.trigger(
        variant === 'danger' ? 'effectTick' : 'notificationSuccess',
        options,
      );
    }, [onPress, variant]);

    return (
      <TouchableOpacity
        onPress={onPressMemoized}
        style={getButtonStyle(variant, disabled)}
        activeOpacity={0.8}
        className="justify-center items-center"
      >
        {children ? children : <Text style={getTextStyle()}>{title}</Text>}
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.title === next.title &&
      prev.children?.props.name === next.children?.props.name &&
      prev.variant === next.variant
    );
  },
);