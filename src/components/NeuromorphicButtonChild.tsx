import React, { ReactNode } from 'react';
import {
  Group,
  interpolate,
  interpolateColors,
  rect,
  RoundedRect,
  rrect,
  Shadow,
} from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

const box1X = width * 0.3;
const box1Y = height * 0.4;
const box1Width = width * 0.4;
const box1Height = width * 0.4;
const box2X = width * 0.285;
const box2Y = height * 0.3925;
const box2Width = width * 0.43;
const box2Height = width * 0.43;

const border = rrect(rect(box1X, box1Y, box1Width, box1Height), 100, 100);
const border2 = rrect(rect(box2X, box2Y, box2Width, box2Height), 105, 105);
type NeuromorphicButtonChild = {
  pressed: SharedValue<number>;
  children: ReactNode;
};

const NeuromorphicButtonChild: React.FC<NeuromorphicButtonChild> = ({
  children,
  pressed,
}) => {
  const outerShadow = useDerivedValue(() => {
    return `rgba(174,174,174,${interpolate(pressed.value, [0, 1], [1, 0])})`;
  }, [pressed]);
  const innerColor = useDerivedValue(() => {
    return interpolateColors(pressed.value, [0, 1], ['#fff', '#f5f5f5']);
  }, [pressed]);

  const dx = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [10, -10]));
  }, [pressed]);
  
  const dy = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [-10, 10]));
  }, [pressed]);

  return (
    <Group>
      <Group>
        <RoundedRect rect={border2} color={'white'} />
      </Group>
      <Group>
        <Shadow blur={10} dy={10} dx={-10} color={outerShadow} />
        <RoundedRect rect={border} color={innerColor} />
        <Shadow
          blur={6}
          inner
          dy={dy}
          dx={dx}
          color={'rgba(174,174,174,0.35)'}
        />
      </Group>
      {children}
    </Group>
  );
};

export default NeuromorphicButtonChild;