import { Text, View } from 'react-native';
import React from 'react';
import {
  Canvas,
  Group,
  rect,
  RoundedRect,
  rrect,
  Shadow,
} from '@shopify/react-native-skia';
import { styles } from '../styles/PushUpCounter';
import { height, width } from '../constants';
import {
  darkInnerBottomRightShadowColor,
  darkInnerTopLeftShadowColor,
} from '../constants/colors';
import Animated from 'react-native-reanimated';
import { newGetStateColor, newGetStateText } from '../utils';

const roundedRect = rrect(rect(0, 0, width * 0.94, height * 0.075), 30, 30);

const Header = ({
  pulseAnimatedStyle,
  currentState,
}: {
  pulseAnimatedStyle: {
    opacity: number;
  };
  currentState: string;
}) => {
  return (
    <View style={styles.headerContainer}>
      <Canvas style={styles.headerBox}>
        <Group>
          <RoundedRect color={'#0B0F18'} rect={roundedRect} />
          <Shadow
            dx={7}
            dy={10}
            color={darkInnerTopLeftShadowColor}
            blur={4}
            inner
          />
          <Shadow
            dx={-7}
            dy={-10}
            color={darkInnerBottomRightShadowColor}
            blur={6}
            inner
          />
        </Group>
      </Canvas>
      <View style={styles.stateRow}>
        <Animated.View
          style={[
            styles.stateDot,
            { backgroundColor: newGetStateColor(currentState) },
            pulseAnimatedStyle,
          ]}
        />
        <Text style={styles.stateText}>{newGetStateText(currentState)}</Text>
      </View>
    </View>
  );
};

export default Header;