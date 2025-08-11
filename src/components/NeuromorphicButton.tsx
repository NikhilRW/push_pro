import React from 'react';
import {
  Canvas,
  DataSourceParam,
  FitBox,
  Group,
  ImageSVG,
  interpolate,
  rect,
  RoundedRect,
  rrect,
  Shadow,
  useSVG,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { styles } from '../styles/PushUpCounter';

type NeuromorphicButtonProps = {
  width: number;
  height: number;
  baseColor: string;
  borderColor: string;
  svgSource: DataSourceParam;
  onPress: () => void;
};

const NeuromorphicButton = ({
  height,
  width,
  baseColor,
  borderColor,
  svgSource,
  onPress,
}: NeuromorphicButtonProps) => {
  const svg = useSVG(svgSource);
  const pressed = useSharedValue(0);

  const box1X = width / 4 + 5;
  const box1Y = 5;
  const box2Width = width;
  const box2Height = height;
  const box2X = box2Width / 4;
  const box2Y = 0;

  const roundedRectangle1 = rrect(
    rect(box1X, box1Y, width - 10, height - 10),
    10,
    10,
  );
  const roundedRectangle2 = rrect(
    rect(box2X, box2Y, box2Width, box2Height),
    12,
    12,
  );

  const dx = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [6, -6]));
  }, [pressed]);

  const dy = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [-6, 6]));
  }, [pressed]);

  const transform = useDerivedValue(() => {
    return [
      {
        scale: interpolate(pressed.value, [0, 1], [1, 0.94]),
      },
      {
        translateY: -4,
      },
    ];
  });

  const onPressedInHandler = () => {
    pressed.value = withTiming(1, { duration: 100 });
  };
  const onPressedOutHandler = () => {
    pressed.value = withTiming(0, { duration: 100 });
    onPress();
  };

  return (
    <Canvas
      style={[styles.flex_1]}
      onTouchStart={onPressedInHandler}
      onTouchEnd={onPressedOutHandler}
    >
      <Group>
        <RoundedRect rect={roundedRectangle2} color={borderColor} />
        <Shadow blur={1} inner dy={1} dx={1} color={'rgba(41, 41, 41,0.2)'} />
        <Shadow blur={1} dy={0} dx={0} color={'rgba(41, 41, 41,1)'} />
      </Group>
      <Group>
        <RoundedRect rect={roundedRectangle1} color={baseColor} />
        <Shadow blur={1} inner dy={dy} dx={dx} color={'rgba(41, 41, 41,0.6)'} />
      </Group>
      <FitBox
        dst={rect(width / 2, height / 6, width / 2, height / 2)}
        src={rect(0, 0, width, height)}
      >
        <Group>
          <ImageSVG
            svg={svg}
            transform={transform}
            strokeWidth={2}
            strokeCap={'round'}
            color={"#16414F"}
          />
        </Group>
      </FitBox>
    </Canvas>
  );
};

export default NeuromorphicButton;