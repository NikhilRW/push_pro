import { Text } from 'react-native';
import React from 'react';
import { styles } from '../../styles/Instructions';
import { useThemeColors } from '../../hooks/useThemeColors';
import Animated, {
  FadingTransition,
  LinearTransition,
  useAnimatedStyle,
} from 'react-native-reanimated';

type InstructionItemProps = {
  message: string;
  instructionNumber: number;
  noOfInstructionShown: number;
};

const InstructionItem = ({
  instructionNumber,
  message,
  noOfInstructionShown,
}: InstructionItemProps) => {
  const theme = useThemeColors();
  const animatedStyle = useAnimatedStyle(() => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      gap:12,
      opacity: noOfInstructionShown - 1 >= instructionNumber ? 1 : 0,
    };
  });
  return (
    <Animated.View layout={FadingTransition} style={animatedStyle}>
      <Animated.Text
        layout={FadingTransition}
        style={[styles.number, { color: theme.primary }]}
      >
        {instructionNumber + 1}.
      </Animated.Text>
      <Animated.Text
        layout={FadingTransition}
        style={[styles.instructionText, { color: theme.text.secondary }]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
};

export default InstructionItem;
