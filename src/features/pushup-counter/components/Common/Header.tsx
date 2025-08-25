import { Text, View } from 'react-native';
import React from 'react';
import {
  Canvas,
  Group,
  rect,
  RoundedRect,
  rrect,
} from '@shopify/react-native-skia';
import { useThemedStyles } from 'pushup-counter/styles/PushUpCounter';
import { useThemeColors } from 'shared/hooks/useThemeColors';
import { height, width } from 'pushup-counter/constants';
import Animated from 'react-native-reanimated';
import { newGetStateColor, newGetStateText } from 'pushup-counter/utils';
import { useTheme } from '@/shared/context/ThemeContext';

const BORDER_WIDTH = 3;

const roundedRect = rrect(rect(BORDER_WIDTH / 2, BORDER_WIDTH / 2, width * 0.93, height * 0.074), 30, 30);

const Header = ({
  pulseAnimatedStyle,
  currentState,
}: {
  pulseAnimatedStyle: {
    opacity: number;
  };
  currentState: string;
}) => {
  const themeColors = useThemeColors();
  const styles = useThemedStyles();
  const { isDark } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <Canvas style={styles.headerBox}>
        {isDark && (
          <Group
            strokeWidth={BORDER_WIDTH}
            style={'stroke'}
            color={themeColors.header.borderColor}
          >
            <RoundedRect rect={roundedRect} />
          </Group>
        )}
        <Group>
          <RoundedRect color={themeColors.header.bgColor} rect={roundedRect} />
          {/* For Nueromorphic Effect */}
          {/* <Shadow
            dx={12}
            dy={10}
            color={themeColors.shadow.innerTopLeft}
            blur={10}
            inner
          />
          <Shadow
            dx={-12}
            dy={-10}
            color={themeColors.shadow.innerBottomRight}
            blur={10}
            inner
          /> */}
        </Group>
      </Canvas>
      <View style={styles.stateRow}>
        <Animated.View
          style={[
            styles.stateDot,
            { backgroundColor: newGetStateColor(currentState) },
            {
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 20,
                  spreadDistance: 2,
                  color: newGetStateColor(currentState),
                },
              ],
            },
            pulseAnimatedStyle,
          ]}
        />
        <Text style={[styles.stateText, { color: themeColors.text.secondary }]}>
          {newGetStateText(currentState)}
        </Text>
      </View>
    </View>
  );
};

export default Header;
