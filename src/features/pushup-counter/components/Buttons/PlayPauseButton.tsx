import { View } from 'react-native';
import React, { memo, useMemo } from 'react';
import NeuromorphicButton from './NeuromorphicButton';
import { useVibrateOnPress } from 'pushup-counter/hooks/useVibrateOnPress';
import { useThemeColors } from 'shared/hooks/useThemeColors';

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
    const vibrateOnPress = useVibrateOnPress(onPress);
    const isActive = variant === 'danger';
    const svgSource = isActive
      ? require('res/svgs/pause.svg')
      : require('res/svgs/play.svg');
    const themeColors = useThemeColors();
    const baseColor =
      themeColors.controlButton[isActive ? 'pause' : 'play'].iconBgColor;
    const height = 80;
    const width = 90;
    const neuromorphicButtonStyle = useMemo(
      () => ({ width, height }),
      [width, height],
    );
    return (
      <View
        className="pt-2"
        style={neuromorphicButtonStyle}
        accessibilityHint="Toggle Play/Pause"
        accessibilityActions={[
          { name: 'Toggle Play/Pause', label: 'Toggle Play/Pause' },
        ]}
        accessibilityRole="button"
        accessible
        onAccessibilityAction={event => {
          event.nativeEvent.actionName === 'Toggle Play/Pause' && onPress();
        }}
      >
        <NeuromorphicButton
          baseColor={baseColor}
          height={height}
          width={width}
          onPressOut={vibrateOnPress}
          svgSource={svgSource}
          svgSize={{ height: 85, width: 85 }}
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
