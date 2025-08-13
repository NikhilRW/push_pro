import { FLIP_DURATION } from '../constants';
import { styles } from '../styles/CustomButton';
import {
  ButtonVariantsType,
  SetVolumeType,
  VolumeType,
} from '../types/PushupCounter';
import {
  Easing,
  runOnJS,
  SharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export const newGetStateColor = (currentSta: string) => {
  switch (currentSta) {
    case 'ready':
      return '#10B981';
    case 'down':
      return '#F59E0B';
    case 'up':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export const newGetStateText = (currentSta: string) => {
  switch (currentSta) {
    case 'ready':
      return 'Ready to Start';
    case 'down':
      return 'Going Down';
    case 'up':
      return 'Push Up!';
    default:
      return 'Waiting...';
  }
};

export const getButtonStyle = (
  buttonVariant: ButtonVariantsType,
  disabled: boolean,
) => {
  const variantStyle =
    `button${buttonVariant[0].toUpperCase() + buttonVariant.slice(1)}` as
      | 'buttonPrimary'
      | 'buttonSecondary'
      | 'buttonDanger'
      | 'buttonSuccess';
  return [
    styles.buttonBase,
    styles[variantStyle],
    disabled && styles.buttonDisabled,
  ];
};

export const flipTextFunc = (
  count: number,
  displayedCount: number,
  animatedRotation: SharedValue<number>,
  setDisplayedCount: React.Dispatch<React.SetStateAction<number>>,
) => {
  'worklet';
  if (count !== displayedCount) {
    // Animate to 90deg (hide old count)
    animatedRotation.value = withTiming(
      90,
      { duration: FLIP_DURATION },
      finished => {
        if (finished) {
          runOnJS(setDisplayedCount)(count);
          animatedRotation.value = withTiming(0, { duration: FLIP_DURATION });
        }
      },
    );
  }
};

export const changeVolume = (volume: VolumeType, setVolume: SetVolumeType) => {
  if (volume === 'high') {
    setVolume('mute');
  } else if (volume === 'mute') {
    setVolume('low');
  } else {
    setVolume('high');
  }
};

export const getVolumeIconName = (volume: VolumeType) => {
  return volume === 'high'
    ? 'volume-up'
    : volume === 'mute'
      ? 'volume-off'
      : 'volume-down';
};

export const animatePulse = (pulseOpacity: SharedValue<number>) => {
  pulseOpacity.value = withRepeat(
    withTiming(1, {
      duration: 1000,
      easing: Easing.bezierFn(0.42, 0, 0.58, 1),
    }),
    Infinity,
    true,
  );
};

export const animatedTextStyle = (
  animatedRotation: SharedValue<number>,
  animatedOpacity: SharedValue<number>,
) => {
  'worklet';
  return {
    transform: [
      { perspective: 800 },
      { rotateX: `${animatedRotation.value}deg` },
    ],
    opacity: animatedOpacity.value,
  };
};

export const getAnimatedPulseStyle = (pulseOpacity: SharedValue<number>) => {
  'worklet';
  return () => {
    'worklet';
    return {
      opacity: pulseOpacity.value,
    };
  };
};

export const animateOpacity = (animatedOpacity: SharedValue<number>) => {
  animatedOpacity.value = withSequence(
    withTiming(0.5, { duration: 120 }),
    withTiming(1, { duration: 180 }),
  );
};
