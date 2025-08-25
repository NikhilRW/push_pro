import React, { useMemo } from 'react';
import {
  BlendColor,
  Canvas,
  DataSourceParam,
  FitBox,
  Group,
  ImageSVG,
  interpolate,
  Paint,
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
import { useThemeColors } from 'shared/hooks/useThemeColors';
import { useTheme } from 'shared/context/ThemeContext';

type NeuromorphicButtonProps = {
  width: number;
  height: number;
  baseColor: string;
  svgSource: DataSourceParam;
  onPressIn?: () => void;
  onPressOut?: () => void;
  svgSize?: { width: number; height: number };
  isVolumeUp?: boolean;
};

const NeuromorphicButton = ({
  height,
  width,
  svgSource,
  onPressIn,
  onPressOut,
  svgSize,
  baseColor,
}: NeuromorphicButtonProps) => {
  const svg = useSVG(svgSource);
  const pressed = useSharedValue(0);

  const roundedRectangle1 = rrect(rect(2, 2, width - 10, height - 10), 10, 10);

  const top_left_dx = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [5, -5]));
  }, [pressed]);

  const top_left_dy = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [5, -5]));
  }, [pressed]);

  const bottom_right_dx = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [-5, 5]));
  }, [pressed]);

  const bottom_right_dy = useDerivedValue(() => {
    return Math.round(interpolate(pressed.value, [0, 1], [-5, 5]));
  }, [pressed]);

  const transform = useDerivedValue(() => {
    return [
      {
        scale: interpolate(pressed.value, [0, 1], [1, 0.92]),
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
    pressed.value = withTiming(1, { duration: 200 });
    if (onPressIn) {
      onPressIn();
    }
  };
  const onPressedOutHandler = () => {
    pressed.value = withTiming(0, { duration: 200 });
    if (onPressOut) {
      onPressOut();
    }
  };

  const themeColors = useThemeColors();
  const { isDark } = useTheme();
  const canvasStyle = useMemo(() => ({ width, height }), [width, height]);
  return (
    <Canvas
      style={canvasStyle}
      onTouchStart={onPressedInHandler}
      onTouchEnd={onPressedOutHandler}
    >
      {isDark && (
        <Group
          strokeWidth={2}
          style={'stroke'}
          color={themeColors.controlButton.borderColor}
        >
          <RoundedRect rect={roundedRectangle1} />
        </Group>
      )}
      <Group>
        <RoundedRect rect={roundedRectangle1} color={baseColor} opacity={1} />
        <Shadow
          blur={9}
          inner
          dy={top_left_dy}
          dx={top_left_dx}
          color={themeColors.controlButton.shadow.topLeft}
        />
        <Shadow
          blur={9}
          inner
          dy={bottom_right_dy}
          dx={bottom_right_dx}
          color={themeColors.controlButton.shadow.bottomRight}
        />
        {/* For Neuromorphic Shadows */}
        {/* <Shadow blur={3} dy={0} dx={0} color={'rgba(255,255,255,0.08)'} />
        <Shadow blur={3} dy={0} dx={0} color={'rgba(0,0,0,0.2)'} /> */}
      </Group>
      <FitBox
        dst={rect(
          (svgSize ? svgSize.width : width - 10) / 2,
          (svgSize ? svgSize.height : height - 10) / 2,
          width / 2,
          height / 2,
        )}
        src={rect(0, 0, width, height)}
      >
        <Group
          layer={
            <Paint>
              <BlendColor color={'#FFFFFF'} mode="srcIn" />
            </Paint>
          }
        >
          <ImageSVG
            svg={svg}
            transform={transform}
            color={'black'}
            strokeWidth={2}
            strokeCap={'round'}
          />
        </Group>
      </FitBox>
    </Canvas>
  );
};

export default NeuromorphicButton;
