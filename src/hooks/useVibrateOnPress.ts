import { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HapticFeedbackOptions } from '../constants';
export const useVibrateOnPress = (onPress: () => void) => {
  return useCallback(() => {
    onPress();
    ReactNativeHapticFeedback.trigger('effectTick', HapticFeedbackOptions);
  }, [onPress]);
};