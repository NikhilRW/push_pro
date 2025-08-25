import { View } from 'react-native';
import React, { memo, useMemo } from 'react';
import NeuromorphicButton from './NeuromorphicButton';
import { DataSourceParam } from '@shopify/react-native-skia';
import { useVibrateOnPress } from 'pushup-counter/hooks/useVibrateOnPress';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export const VolumeButton = memo(
  ({
    onPress,
    volumeIcon,
  }: {
    onPress: () => void;
    volumeIcon: DataSourceParam;
  }) => {
    const height = 80;
    const width = 90;
    const vibrateOnPress = useVibrateOnPress(onPress);
    const baseColor = useThemeColors().controlButton.volume.iconBgColor;
    const neuromorphicButtonStyle = useMemo(
      () => ({ width, height }),
      [width, height],
    );
    return (
      <View
        accessibilityHint="Change Volume Level"
        accessibilityActions={[{ name: "Change Volume Level", label: "Change Volume Level" }]}
        accessible
        accessibilityRole="button"
        onAccessibilityAction={(event) => {
          event.nativeEvent.actionName === "Change Volume Level" && onPress();
        }}
        className="pt-2"
        style={neuromorphicButtonStyle}
      >

        <NeuromorphicButton
          baseColor={baseColor}
          height={height}
          width={width}
          onPressOut={vibrateOnPress}
          svgSource={volumeIcon}
          svgSize={{ height: 75, width: 85 }}
        />
      </View>
    );
  },
  (prev, next) => prev.volumeIcon === next.volumeIcon,
);
