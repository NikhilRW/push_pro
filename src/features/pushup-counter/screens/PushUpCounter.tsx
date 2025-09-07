import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  AccessibilityInfo,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useThemeColors } from 'shared/hooks/useThemeColors';
import { useThemedStyles } from 'pushup-counter/styles/PushUpCounter';
import {
  FaceDetectionOptions,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePushupSharedVals } from 'pushup-counter/hooks/usePushupSharedVals';
import { usePushupFrameProcessor } from 'pushup-counter/hooks/usePushupFrameProcessor';
import { useWorkletJsFuncs } from 'pushup-counter/hooks/useWorkletJsFuncs';

import {
  getAnimatedTextStyle,
  animateOpacity,
  animatePulse,
  annouceCountAfterChange,
  findVideoFormat,
  flipTextFunc,
  getAnimatedPulseStyle,
} from 'pushup-counter/utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Sound from 'react-native-sound';
import PermisssionRejectedCard from 'pushup-counter/components/Card/PermisssionRejectedCard';
import PushupCamera from 'pushup-counter/components/Common/PushupCamera';
import Header from 'pushup-counter/components/Common/Header';
import DebugCard from 'pushup-counter/components/Card/DebugCard';
import ControlButtons from 'pushup-counter/components/Buttons/ControlButtons';
import useRequestCameraWithRationale from 'pushup-counter/hooks/useRequestCameraWithRationale';
import { useDatabase } from 'shared/context/DatabaseContext';
// import IncrementButton from '../components/Buttons/IncrementButton';

export default function PushUpCounter() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const styles = useThemedStyles();
  const pulseOpacity = useSharedValue(0);
  const [count, setCount] = useState(0);
  const [currentState, setCurrentState] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [lastFaceY, setLastFaceY] = useState(0);
  const [volume, setVolume] = useState<'mute' | 'high' | 'low'>('low');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { savePushupLog } = useDatabase();

  const whenLastMessageIncluded = useRef<{ lastCount: number }>({
    lastCount: 0,
  });
  const debugMode = false;
  const sound = useRef<{ sound: Sound | null; motivation: boolean }>({
    motivation: false,
    sound: null,
  });
  const [bufferInfo, setBufferInfo] = useState({
    bufferSize: 0,
    currentPattern: 'none',
    minY: 0,
    maxY: 0,
    range: 0,
  });

  const animatePulseFunc = useCallback(
    () => animatePulse(pulseOpacity),
    [pulseOpacity],
  );

  const animatedRotation = useSharedValue(0);
  const animatedOpacity = useSharedValue(1);
  const [displayedCount, setDisplayedCount] = useState(count);

  // Animated style for flipping and fading
  const animatedStyle = useAnimatedStyle(() =>
    getAnimatedTextStyle(animatedRotation, animatedOpacity),
  );

  const flipText = useCallback(
    () =>
      flipTextFunc(count, displayedCount, animatedRotation, setDisplayedCount),
    [animatedRotation, count, displayedCount],
  );

  useEffect(() => {
    flipText();
  }, [count, displayedCount, animatedRotation, flipText]);

  // Trigger a subtle fade whenever the count changes
  useEffect(() => {
    animateOpacity(animatedOpacity);
  }, [count, animatedOpacity]);

  useEffect(() => {
    // For Intilization After Component Rendered First Time.
    animateOpacity(animatedOpacity);
  }, [animatedOpacity]);

  useEffect(() => {
    animatePulseFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && sessionStartTime) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, sessionStartTime]);

  // Show save modal when reset button is clicked and there are pushups logged

  const {
    bufferIndex,
    faceYBuffer,
    lastAnalysisTime,
    lastFaceDisappearedTime,
  } = usePushupSharedVals();

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    contourMode: 'all',
    performanceMode: 'fast',
    landmarkMode: 'all',
  }).current;

  const faceDetector = useFaceDetector(faceDetectionOptions);
  const device = useCameraDevice('front');
  const deviceFormat = device!.formats.find(findVideoFormat);
  const videoHeight = deviceFormat?.videoHeight!;
  const { hasPermission, requestPermission } = useCameraPermission();
  const { requestCameraWithRationale } =
    useRequestCameraWithRationale(requestPermission);

  const {
    incrementCount,
    resetStateToReady,
    updateBufferInfo,
    updateLastFaceY,
    updateState,
  } = useWorkletJsFuncs({
    setCurrentState,
    setCount,
    setLastFaceY,
    setBufferInfo,
  });

  useEffect(() => {
    const main = async () => {
      if (await AccessibilityInfo.isAccessibilityServiceEnabled()) {
        annouceCountAfterChange(
          volume === 'mute' ? 'high' : volume,
          count,
          sound,
          whenLastMessageIncluded,
        );
      } else {
        annouceCountAfterChange(volume, count, sound, whenLastMessageIncluded);
      }
    };
    main();
  }, [count, volume]);

  useEffect(() => {
    const main = async () => {
      const screenReaderEnabled =
        await AccessibilityInfo.isScreenReaderEnabled();
      if (screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility('Push-up counter screen');
      }
    };
    main();
  }, []);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        requestCameraWithRationale();
      }
    })();
  }, [hasPermission, requestCameraWithRationale, requestPermission]);

  const frameProcessor = usePushupFrameProcessor({
    faceDetector,
    incrementCount,
    resetStateToReady,
    updateBufferInfo,
    isActive,
    updateLastFaceY,
    lastAnalysisTime,
    updateState,
    faceYBuffer,
    lastFaceDisappearedTime,
    videoHeight,
  });

  const resetCounter = useCallback(() => {
    setCount(0);
    setCurrentState('ready');
    setLastFaceY(0);
    setSessionStartTime(null);
    setSessionDuration(0);
    setBufferInfo({
      bufferSize: 0,
      currentPattern: 'none',
      minY: 0,
      maxY: 0,
      range: 0,
    });
    faceYBuffer.value = [];
    bufferIndex.value = 0;
    lastAnalysisTime.value = 0;
    lastFaceDisappearedTime.value = 0;
  }, [bufferIndex, faceYBuffer, lastAnalysisTime, lastFaceDisappearedTime]);

  const toggleActive = useCallback(() => {
    setIsActive(prev => {
      const newIsActive = !prev;

      if (newIsActive && !sessionStartTime) {
        // Starting a new session
        setSessionStartTime(Date.now());
        setSessionDuration(0);
      } else if (!newIsActive && sessionStartTime) {
        // Ending a session
        // Duration is already being tracked by the useEffect
      }

      return newIsActive;
    });
  }, [sessionStartTime]);

  const handleSaveSession = useCallback(async () => {
    if (count > 0 && sessionDuration > 0) {
      try {
        console.log('Attempting to save session:', {
          count,
          duration: sessionDuration,
        });
        const savedId = await savePushupLog(count, sessionDuration);
        console.log('Session saved successfully with ID:', savedId);
        setShowSaveModal(false);
        resetCounter();
      } catch (error) {
        console.error('Error saving session:', error);
        // Show error to user
        Alert.alert('Save Error', 'Failed to save session. Please try again.');
      }
    }
  }, [count, sessionDuration, savePushupLog, resetCounter]);

  const handleDiscardSession = useCallback(() => {
    setShowSaveModal(false);
    resetCounter();
  }, [resetCounter]);

  const pulseAnimatedStyle = useAnimatedStyle(
    getAnimatedPulseStyle(pulseOpacity),
    [pulseOpacity],
  );
  const handleResetWithModal = useCallback(() => {
    if (count > 0 && sessionDuration > 0) {
      setShowSaveModal(true);
    } else {
      resetCounter();
    }
  }, [count, resetCounter, sessionDuration]);

  const controlButtonsProps = useMemo(
    () => ({
      isActive,
      resetCounter: handleResetWithModal,
      setVolume,
      toggleActive,
      volume,
      showSaveButton: false, // Modal handles save functionality
      onSave: handleSaveSession,
      sessionDuration,
    }),
    [
      isActive,
      handleResetWithModal,
      toggleActive,
      volume,
      handleSaveSession,
      sessionDuration,
    ],
  );

  if (!device || !hasPermission) {
    return <PermisssionRejectedCard />;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: themeColors.background },
      ]}
    >
      {/* Hidden Camera */}
      <PushupCamera
        device={device}
        deviceFormat={deviceFormat!}
        frameProcessor={frameProcessor}
        isActive={isActive}
      />

      {/* Header */}
      <Header
        currentState={currentState}
        pulseAnimatedStyle={pulseAnimatedStyle}
      />
      {/* Main Counter */}
      <View style={styles.counterContainer}>
        <Animated.View style={[animatedStyle]}>
          <Text style={styles.countText}>{displayedCount}</Text>
        </Animated.View>
      </View>

      {/* Status Card */}
      {debugMode && <DebugCard bufferInfo={bufferInfo} lastFaceY={lastFaceY} />}

      {/* <IncrementButton onPress={incrementCount} /> */}
      {/* Control Buttons */}
      <ControlButtons {...controlButtonsProps} />

      {/* Save Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSaveModal}
        onRequestClose={handleDiscardSession}
      >
        <View style={[styles.modalContainer]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: themeColors.text.primary }]}
            >
              Save Session?
            </Text>
            <Text
              style={[styles.modalText, { color: themeColors.text.secondary }]}
            >
              Do you want to save this session?
            </Text>
            <Text
              style={[styles.modalStats, { color: themeColors.text.primary }]}
            >
              Pushups: {count} | Duration: {sessionDuration}s
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { backgroundColor: themeColors.border },
                ]}
                onPress={handleDiscardSession}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: themeColors.text.primary },
                  ]}
                >
                  Discard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleSaveSession}
              >
                <Text style={[styles.modalButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
