import NeuromorphicButton from './NeuromorphicButton';
import { View } from 'react-native';
import React from 'react';
import { useVibrateOnPress } from '../../hooks/useVibrateOnPress';
import { useThemeColors } from '../../hooks/useThemeColors';

export const RestartButton = ({
  onPress,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const svgSource = require('../../res/svgs/refresh.svg');
  const height = 80;
  const width = 90;
  const vibrateOnPress = useVibrateOnPress(onPress);
  const themeColors = useThemeColors();

  return (
    <View className="pt-2" style={{ height, width }}>
      <NeuromorphicButton
        baseColor={themeColors.controlButton.restart.iconBgColor}
        height={height}
        width={width}
        onPressOut={vibrateOnPress}
        svgSource={svgSource}
        svgSize={{ height: 75, width: 85 }}
      />
    </View>
  );
};
