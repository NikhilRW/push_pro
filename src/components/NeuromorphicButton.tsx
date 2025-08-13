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

type NeuromorphicButtonProps = {
  width: number;
  height: number;
  baseColor: string;
  svgSource: DataSourceParam;
  onPress: () => void;
  svgSize?: { width: number; height: number };
  isVolumeUp?:boolean
};

const NeuromorphicButton = ({
  height,
  width,
  baseColor,
  svgSource,
  onPress,
  svgSize,
  isVolumeUp
}: NeuromorphicButtonProps) => {
  const svg = useSVG(svgSource);
  const pressed = useSharedValue(0);

  const roundedRectangle1 = rrect(rect(0, 0, width - 10, height - 10), 10, 10);

  const dx = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [-6, 6]));
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
        translateY: -50,
      },
      {
        translateX: -50,
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
      style={{ width, height }}
      onTouchStart={onPressedInHandler}
      onTouchEnd={onPressedOutHandler}
    >
      <Group>
        <RoundedRect rect={roundedRectangle1} color={baseColor} />
        <Shadow blur={3} inner dy={dy} dx={dx} color={'rgba(41, 41, 41,0.8)'} />
        <Shadow blur={3} dy={0} dx={0} color={'rgba(255,255,255,0.08)'} />
        <Shadow blur={3} dy={0} dx={0} color={'rgba(0,0,0,0.2)'} />
      </Group>
      <FitBox
        dst={rect((width - 10) / 2, (svgSize || isVolumeUp ? height : height - 10 ) / 2, width / 2, height / 2)}
        src={rect(0, 0, width, height)}
      >
        <Group>
          <ImageSVG
            svg={svg}
            transform={transform}
            strokeWidth={2}
            strokeCap={'round'}
          />
        </Group>
      </FitBox>
    </Canvas>
  );
};

export default NeuromorphicButton;