import {
  View,
  Text,
  Image,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { colors } from '../constants/colors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';
import Animated, { JumpingTransition, LinearTransition } from 'react-native-reanimated';
import { instructionMessages} from '../constants';
import { styles } from '../styles/Instructions';
import InstructionItem from '../components/Common/InstructionItem';

const Instructions = () => {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme!];
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [noOfInstructionShown, setNoOfInstructionShown] = useState(1);

  const incrementStepsShown = () => {
    setNoOfInstructionShown((previous)=>previous+1);
  };

  const navigateToPushupCounter = () => {
    navigation.navigate('PushupCounter', {});
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.shadow.default,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require('../res/pngs/doingpushup2.png')} // Placeholder for pushup image
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            How to Use Push Pro Counter
          </Text>
          <Animated.View style={styles.instructionsContainer}  layout={LinearTransition.duration(500)}>
            {instructionMessages.map((item, index) => {
              return (
                <InstructionItem noOfInstructionShown={noOfInstructionShown} instructionNumber={index} message={item} />
              );
            })}
          </Animated.View>
        </View>
      </Animated.View>
      <TouchableOpacity
        onPress={incrementStepsShown}
        style={styles.instructionItem}
        className="bg-[#ff9900] rounded-xl mx-auto mt-10 px-5 py-4 text-center"
      >
        <Text className="text-white font-semibold text-center">Next Step</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Instructions;
// Start Counting Pushups