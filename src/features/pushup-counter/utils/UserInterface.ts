import { FLIP_DURATION } from 'pushup-counter/constants';
import { styles } from 'pushup-counter/styles/CustomButton';
import {
  ButtonVariantsType,
  SetVolumeType,
  VolumeType,
} from 'pushup-counter/types/PushupCounter';
import {
  Easing,
  runOnJS,
  SharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export const newGetStateColor = (currentState: string) => {
  switch (currentState) {
    case 'ready':
      return '#22C55E'; // Bright green for ready state
    case 'tracking':
      return '#3B82F6'; // Blue for active tracking
    case 'pattern_found':
      return '#8B5CF6'; // Purple for successful pattern detection
    case 'face_gone_down_phase':
      return '#F59E0B'; // Amber for face temporarily gone (expected during pushup)
    default:
      return '#6B7280'; // Neutral gray for other states
  }
};

export const newGetStateText = (currentState: string) => {
  switch (currentState) {
    case 'ready':
      return 'Ready to Start';
    case 'tracking':
      return 'Tracking Movement';
    case 'pattern_found':
      return 'Push-up Counted!';
    case 'face_gone_down_phase':
      return 'Keep Going Down';
    default:
      return 'Get in Position';
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

export const getAnimatedTextStyle = (
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

export const getVolumeIcon = (volume: VolumeType) => {
  switch (volume) {
    case 'low':
      return require('res/svgs/volume-down.svg');
    case 'high':
      return require('res/svgs/volume-up.svg');
    case 'mute':
      return require('res/svgs/volume-off.svg');
  }
};
