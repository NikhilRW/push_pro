import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors } from 'shared/constants/colors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'shared/types/Navigation';
import Animated, { CurvedTransition, LinearTransition } from 'react-native-reanimated';
import { instructionMessages } from 'instructions/constants/instructions-steps';
import { styles } from 'instructions/styles/Instructions';
import InstructionItem from 'instructions/components/InstructionItem';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Video from 'react-native-video';

const Instructions = () => {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme!];
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [noOfInstructionShown, setNoOfInstructionShown] = useState(1);

  const incrementStepsShown = () => {
    setNoOfInstructionShown(previous => previous + 1);
    if (noOfInstructionShown === instructionMessages.length) {
      navigateToPushupCounter();
    }
    AccessibilityInfo.announceForAccessibility(
      instructionMessages[noOfInstructionShown - 1],
    );
  };

  const navigateToPushupCounter = () => {
    navigation.navigate('PushupCounter', {});
  };
  useEffect(() => {
    const main = async () => {
      const screenReaderEnabled =
        await AccessibilityInfo.isScreenReaderEnabled();
      if (screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility('Instructions screen');
        AccessibilityInfo.announceForAccessibility(instructionMessages[0]);
      }
    };
    main();
  }, []);

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
        layout={CurvedTransition}
      >
        <View style={styles.imageContainer}>
          <Video
            source={require('res/mp4s/doingpushup7.mp4')}
            style={styles.video}
            resizeMode="cover"
            repeat={true}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            How to Use Push Pro Counter
          </Text>
          <Animated.View
            style={styles.instructionsContainer}
            layout={LinearTransition.duration(500)}
          >
            {instructionMessages
              .slice(0, noOfInstructionShown)
              .map((item, index) => {
                return (
                  <InstructionItem
                    key={index}
                    noOfInstructionShown={noOfInstructionShown}
                    instructionNumber={index}
                    message={item}
                  />
                );
              })}
          </Animated.View>
        </View>
      </Animated.View>
      <TouchableOpacity
        onPress={incrementStepsShown}
        style={styles.instructionItem}
        accessibilityHint="Show Next Instruction"
        accessibilityActions={[
          { name: 'Show Next Instruction', label: 'Show Next Instruction' },
        ]}
        accessible
        accessibilityRole="button"
        onAccessibilityAction={event => {
          event.nativeEvent.actionName === 'Show Next Instruction' &&
            incrementStepsShown();
        }}
        className="bg-[#ff9900] rounded-xl mx-auto gap-1 items-center justify-center mt-10 px-5 py-4 text-center"
      >
        <Text className="font-semibold text-lg text-white">
          {noOfInstructionShown !== instructionMessages.length
            ? 'Next Step'
            : 'Start Counting'}
        </Text>
        <MaterialIcons
          name={`${noOfInstructionShown !== instructionMessages.length ? 'navigate-next' : 'play-arrow'}`}
          size={30}
          color={'white'}
          style={styles.stepNavigationIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Instructions;
