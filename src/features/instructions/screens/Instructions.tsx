import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  AccessibilityInfo,
  StatusBar,
  ScrollView,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from 'shared/constants/colors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'shared/types/Navigation';
import Animated, {
  CurvedTransition,
  LinearTransition,
  FadeIn,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { instructionMessages } from 'instructions/constants/instructions-steps';
import { styles } from 'instructions/styles/Instructions';
import InstructionItem from 'instructions/components/InstructionItem';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Video, { VideoRef } from 'react-native-video';


const Instructions = () => {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme!];
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [noOfInstructionShown, setNoOfInstructionShown] = useState(1);

  // Animation values
  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const incrementStepsShown = () => {
    // Button press animation
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1);
    });

    setNoOfInstructionShown(previous => previous + 1);

    // Update progress bar
    progressWidth.value = withTiming(
      ((noOfInstructionShown + 1) / instructionMessages.length) * 100,
      { duration: 300 },
    );

    if (noOfInstructionShown === instructionMessages.length) {
      // Fade out card before navigation
      cardOpacity.value = withTiming(0.8, { duration: 200 }, () => {
        navigateToPushupCounter();
      });
    }

    AccessibilityInfo.announceForAccessibility(
      instructionMessages[noOfInstructionShown - 1],
    );
  };

  const navigateToPushupCounter = () => {
    'worklet';
    runOnJS(navigation.navigate)({ name: 'PushupCounter', params: {} });
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

    // Initialize progress bar
    progressWidth.value = withTiming((1 / instructionMessages.length) * 100, {
      duration: 500,
    });
  }, [progressWidth]);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const isLastStep = noOfInstructionShown === instructionMessages.length;
  const videoRef = useRef<VideoRef>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      videoRef.current?.resume();
    }
    else {
      videoRef.current?.pause();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      bounces={true}
      overScrollMode="always"
      style={[styles.scrollView, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {/* Header with Progress */}
      <Animated.View
        entering={FadeInUp.delay(100)}
        style={styles.headerContainer}
      >
        <View style={styles.headerRow}>
          <Text
            style={[styles.headerTitle, { color: theme.text.primary }]}
          >
            Setup Instructions
          </Text>
          <View
            style={[
              styles.progressBadge,
              {
                backgroundColor: theme.surface,
                shadowColor: theme.shadow.default,
              },
            ]}
          >
            <Text
              style={[styles.progressBadgeText, { color: theme.text.secondary }]}
            >
              {noOfInstructionShown} of {instructionMessages.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: theme.background,
              shadowColor: theme.shadow.default,
            },
          ]}
        >
          <Animated.View
            style={[styles.progressBar, animatedProgressStyle]}
          />
        </View>
      </Animated.View>
      {/* Main Content Card */}
      <Animated.View
        style={[
          styles.card,
          styles.mainCard,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.shadow.default,
          },
          animatedCardStyle,
        ]}
        layout={CurvedTransition}
        entering={FadeIn.delay(200)}
      >
        {/* Video Container */}
        <View style={styles.videoContainer}>
          <Video
            source={require('res/mp4s/doingpushup7.mp4')}
            style={styles.video}
            resizeMode="cover"
            repeat={true}
            muted={true}
            ref={videoRef}
          />

          {/* Video Overlay */}
          <View style={styles.videoOverlay} />

          {/* Play Icon Overlay */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <MaterialIcons name={`${isPaused ? 'play-arrow' : 'pause'}`} size={24} color="#ff9900" />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <Text
            style={[styles.mainTitle, { color: theme.text.primary }]}
          >
            Push Pro Counter
          </Text>

          <Text
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            Follow these steps to get the best counting experience
          </Text>

          {/* Instructions Container */}
          <Animated.View
            style={styles.instructionsContainer}
            layout={LinearTransition.duration(400)}
          >
            {instructionMessages
              .slice(0, noOfInstructionShown)
              .map((item, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(index * 100)}
                >
                  <InstructionItem
                    noOfInstructionShown={noOfInstructionShown}
                    instructionNumber={index}
                    message={item}
                  />
                </Animated.View>
              ))}
          </Animated.View>
        </View>
      </Animated.View>
      {/* Action Button */}
      <Animated.View
        style={[styles.buttonContainer, animatedButtonStyle]}
        entering={FadeInUp.delay(400)}
      >
        <TouchableOpacity
          onPress={incrementStepsShown}
          style={styles.primaryButton}
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
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isLastStep ? 'Start Counting' : 'Next Step'}
          </Text>

          <MaterialIcons
            name={isLastStep ? 'play-arrow' : 'navigate-next'}
            size={28}
            color="white"
          />
        </TouchableOpacity>

        {/* Skip Button */}
        {!isLastStep && (
          <TouchableOpacity
            onPress={navigateToPushupCounter}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.skipButtonText, { color: theme.text.secondary }]}
            >
              Skip Instructions
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default Instructions;