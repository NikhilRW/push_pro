import NeuromorphicButton from './NeuromorphicButton';
import { AccessibilityInfo, View } from 'react-native';
import React, { useMemo } from 'react';
import { useVibrateOnPress } from 'pushup-counter/hooks/useVibrateOnPress';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export const RestartButton = ({
  onPress,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const svgSource = require('res/svgs/refresh.svg');
  const height = 80;
  const width = 90;
  const vibrateOnPress = useVibrateOnPress(onPress);
  const themeColors = useThemeColors();
  const neuromorphicButtonStyle = useMemo(
    () => ({ width, height }),
    [width, height],
  );

  return (
    <View
      className="pt-2"
      style={neuromorphicButtonStyle}
      accessibilityHint="Restart Count"
      accessibilityActions={[
        { name: 'Restart Count', label: 'Restart Count' },
      ]}
      accessible
      accessibilityRole="button"
      onAccessibilityAction={event => {
        event.nativeEvent.actionName === 'Restart Count' && onPress();
      }}
    >
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
