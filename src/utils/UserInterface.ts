import { FLIP_DURATION } from '../constants';
import { styles } from '../styles/CustomButton';
import {
  ButtonVariantsType,
  SetVolumeType,
  VolumeType,
} from '../types/PushupCounter';
import { runOnJS, SharedValue, withTiming } from 'react-native-reanimated';

// export const getStateColor = (state: string) => {
//   switch (state) {
//     case 'tracking':
//       return '#2196F3'; // Blue - actively tracking
//     case 'face_gone_down_phase':
//       return '#FF9800'; // Orange - face gone (down phase)
//     case 'pattern_found':
//       return '#4CAF50'; // Green - pattern detected
//     case 'counted':
//       return '#4CAF50'; // Green - just counted
//     default:
//       return '#666'; // Gray - ready
//   }
// };

// export const getStateText = (state: string) => {
//   switch (state) {
//     case 'tracking':
//       return 'Tracking';
//     case 'face_gone_down_phase':
//       return 'Down Phase';
//     case 'pattern_found':
//       return 'Pattern Found!';
//     case 'counted':
//       return 'Counted!';
//     default:
//       return 'Ready';
//   }
// };

// export const getPatternColor = (pattern: string) => {
//   switch (pattern) {
//     case 'up_gone_return':
//       return '#4CAF50'; // Green - face gone pattern (most accurate)
//     case 'up_down_up':
//       return '#8BC34A'; // Light green - simple up-down pattern
//     case 'no_face_gone_phase':
//       return '#FF5722'; // Deep orange - need face gone phase
//     case 'insufficient_range':
//       return '#FF9800'; // Orange - not enough movement
//     case 'insufficient_data':
//     case 'insufficient_face_data':
//       return '#2196F3'; // Blue - building buffer
//     case 'face_lost':
//       return '#F44336'; // Red - face lost too long
//     default:
//       return '#666'; // Gray - analyzing
//   }
// };

// export const getPatternText = (pattern: string) => {
//   switch (pattern) {
//     case 'reference_set':
//       return 'Start Position Set';
//     case 'invalid_return_position':
//       return 'Return to Start';
//     case 'up_gone_return':
//       return 'Up→Gone→Return';
//     case 'up_down_up':
//       return 'Up→Down→Up';
//     case 'no_face_gone_phase':
//       return 'Need Face Gone Phase';
//     case 'insufficient_range':
//       return 'Small Movement';
//     case 'insufficient_data':
//       return 'Building Buffer';
//     case 'insufficient_face_data':
//       return 'Need More Face Data';
//     case 'face_lost':
//       return 'Face Lost';
//     default:
//       return 'Analyzing';
//   }
// };

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
