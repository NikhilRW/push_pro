import React from 'react';
import { styles } from 'instructions/styles/Instructions';
import { useThemeColors } from 'shared/hooks/useThemeColors';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Text } from 'react-native';

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
      gap: 12,
      opacity: noOfInstructionShown - 1 >= instructionNumber ? 1 : 0,
      height: 'auto',
    };
  });
  return (
    <Animated.View entering={FadeInLeft} style={animatedStyle}>
      <Text style={[styles.number, { color: theme.primary }]}>
        {instructionNumber + 1}.
      </Text>
      <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default InstructionItem;
