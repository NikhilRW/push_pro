import React, { memo, useMemo } from 'react';
import { height, width } from '../../constants';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  Canvas,
  Group,
  rect,
  RoundedRect,
  rrect,
} from '@shopify/react-native-skia';
import { useThemedStyles } from '../../styles/PushUpCounter';
import { useTheme } from '../../context/ThemeContext';

const ButtonBackground = () => {
  const roundedRect = useMemo(
    () =>
      rrect(
        rect((width * 0.1) / 2, height * 0.02, width * 0.9, height * 0.2),
        20,
        20,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height],
  );
  const themeColors = useThemeColors();
  const styles = useThemedStyles();
  const { isDark } = useTheme();

  return (
    <Canvas style={[styles.flex_1]}>
      {isDark && (
        <Group
          strokeWidth={4}
          style={'stroke'}
          color={themeColors.controlButtonContainer.borderColor}
        >
          <RoundedRect rect={roundedRect} />
        </Group>
      )}

      <Group>
        <RoundedRect
          color={themeColors.controlButtonContainer.bgColor}
          rect={roundedRect}
        />
        {/* For Extreme Neuromorphic Effect */}
        {/* <Shadow
          dx={4.5}
          dy={4.5}
          color={themeColors.controlButtonContainer.shadow.inner.topLeft}
          blur={1}
          inner
        />
        <Shadow
          dx={-4.5}
          dy={-4.5}
          color={themeColors.controlButtonContainer.shadow.outer.topLeft}
          blur={5}
        />
        <Shadow
          dx={7}
          dy={7}
          color={themeColors.controlButtonContainer.shadow.inner.bottomRight}
          blur={4}
        /> */}
      </Group>
    </Canvas>
  );
};

export default memo(ButtonBackground);
