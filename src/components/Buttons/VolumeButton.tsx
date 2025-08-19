import { View } from 'react-native';
import React, { memo } from 'react';
import NeuromorphicButton from './NeuromorphicButton';
import { DataSourceParam } from '@shopify/react-native-skia';
import { useVibrateOnPress } from '../../hooks/useVibrateOnPress';
import { useThemeColors } from '../../hooks/useThemeColors';

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
    return (
      <View className="pt-2" style={{ height, width }}>
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
