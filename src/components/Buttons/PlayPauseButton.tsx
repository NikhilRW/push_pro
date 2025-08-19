import { View } from 'react-native';
import React, { memo } from 'react';
import NeuromorphicButton from './NeuromorphicButton';
import { useVibrateOnPress } from '../../hooks/useVibrateOnPress';
import { useThemeColors } from '../../hooks/useThemeColors';

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
      ? require('../../res/svgs/pause.svg')
      : require('../../res/svgs/play.svg');
    const themeColors = useThemeColors();
    const baseColor =
      themeColors.controlButton[isActive ? 'pause' : 'play'].iconBgColor;
    const height = 80;
    const width = 90;
    return (
      <View className="pt-2" style={{ height, width }}>
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
