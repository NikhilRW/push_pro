import { Text, TouchableOpacity } from 'react-native';
import { styles } from 'pushup-counter/styles/CustomButton';
import React, { memo, useCallback } from 'react';
import { getButtonStyle } from 'pushup-counter/utils';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { SetVolumeType, VolumeType } from 'pushup-counter/types/PushupCounter';
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
    onPress: (volume?: VolumeType, setVolume?: SetVolumeType) => void;
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
