import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import {
  FaceDetectionOptions,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePushupSharedVals } from '../hooks/usePushupSharedVals';
import { usePushupFrameProcessor } from '../hooks/usePushupFrameProcessor';
import { useWorkletJsFuncs } from '../hooks/useWorkletJsFuncs';
import { CustomButton } from '../components/CustomButton';
import { StatusCard } from '../components/StatusCard';
import { styles } from '../styles/PushUpCounter';
import {
  newGetStateColor,
  newGetStateText,
  speakUsingElevenLabs,
} from '../utils/PushUpCounter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useStoragePermission } from '../hooks/useStoragePermission';
// PERFORMANCE: Import optimization utilities
import Sound from 'react-native-sound';

export default function PushUpCounter() {
  const insets = useSafeAreaInsets();

  // PERFORMANCE: Optimized state management
  const [count, setCount] = useState(0);
  const [currentState, setCurrentState] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [lastFaceY, setLastFaceY] = useState(0);
  const whenLastMessageIncluded = useRef<{ lastCount: number }>({
    lastCount: 1,
  });
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

  // For animated flip
  const FLIP_DURATION = 300;
  const animatedRotation = useSharedValue(0);
  const [displayedCount, setDisplayedCount] = useState(count);

  // Animated style for flipping
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${animatedRotation.value}deg` },
    ],
  }));

  const flipText = useCallback(() => {
    'worklet';
    if (count !== displayedCount) {
      // Animate to 90deg (hide old count)
      animatedRotation.value = withTiming(
        90,
        { duration: FLIP_DURATION },
        finished => {
          if (finished) {
            runOnJS(setDisplayedCount)(count);
            // Animate back to 0deg (show new count)
            animatedRotation.value = withTiming(0, { duration: FLIP_DURATION });
          }
        },
      );
    }
  }, [animatedRotation, count, displayedCount]);

  useEffect(() => {
    flipText();
  }, [count, displayedCount, animatedRotation, flipText]);

  const {
    bufferIndex,
    faceYBuffer,
    lastAnalysisTime,
    lastFaceDisappearedTime,
  } = usePushupSharedVals();

  // PERFORMANCE: Optimized face detection options
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    contourMode: 'all',
    performanceMode: 'fast', // Changed from 'accurate' to 'fast' for performance
    landmarkMode: 'all',
  }).current;

  const faceDetector = useFaceDetector(faceDetectionOptions);
  const device = useCameraDevice('front');
  const deviceFormat = device!.formats.find(
    f => f.videoWidth <= 640 && f.videoHeight <= 480,
  );
  const videoHeight = deviceFormat?.videoHeight!;
  const { hasPermission, requestPermission } = useCameraPermission();
  const { hasStoragePermission, requestStoragePermission } =
    useStoragePermission();

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
    (async () => {
      const response = await speakUsingElevenLabs(
        count,
        whenLastMessageIncluded,
        sound.current.motivation && sound.current.sound!.isPlaying(),
      )()!;
      if (response !== null) {
        sound.current.sound = response.sound;
        sound.current.motivation = response.motivation;
      }
    })();
  }, [count]);

  useMemo(() => {
    if (!hasPermission) {
      requestPermission();
    }
    if (!hasStoragePermission) {
      requestStoragePermission();
    }
  }, [
    hasPermission,
    hasStoragePermission,
    requestPermission,
    requestStoragePermission,
  ]);

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

  const resetCounter = () => {
    setCount(0);
    setCurrentState('ready');
    setLastFaceY(0);
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
  };

  if (!device || !hasPermission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View style={styles.permissionBox}>
          <ActivityIndicator
            size="large"
            color="#3B82F6"
            style={styles.permissionLoader}
          />
          <Text style={styles.permissionTitle}>Setting up Camera</Text>
          <Text style={styles.permissionSubtitle}>
            Please allow camera permission to continue
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      {/* Hidden Camera */}
      <View style={styles.hiddenCamera}>
        <Camera
          style={styles.hiddenCamera}
          device={device}
          isActive={isActive}
          frameProcessor={frameProcessor}
          fps={15}
          format={deviceFormat}
        />
      </View>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Push-Up Counter</Text>
        <View style={styles.stateRow}>
          <View
            style={[
              styles.stateDot,
              { backgroundColor: newGetStateColor(currentState) },
            ]}
          />
          <Text style={styles.stateText}>{newGetStateText(currentState)}</Text>
        </View>
      </View>
      {/* Main Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterBox}>
          {/* Animated Flip Text */}
          <Animated.View style={[animatedStyle]}>
            <Text style={styles.countText}>{displayedCount}</Text>
          </Animated.View>
        </View>
      </View>
      {/* Status Cards */}
      <View style={styles.statusRow}>
        <StatusCard
          title="Face Position"
          value={lastFaceY ? lastFaceY.toFixed(0) : '---'}
          subtitle="Y coordinate"
        />
        <StatusCard
          title="Buffer Size"
          value={bufferInfo.bufferSize}
          subtitle={`Range: ${bufferInfo.range.toFixed(0)}`}
        />
      </View>
      {/* Control Buttons */}
      <View style={styles.buttonBox}>
        <View style={styles.buttonRow}>
          <CustomButton
            title={isActive ? 'Stop' : 'Start'}
            onPress={() => setIsActive(!isActive)}
            variant={isActive ? 'danger' : 'primary'}
          />
          <CustomButton
            title="Reset"
            onPress={resetCounter}
            variant="secondary"
          />
          <CustomButton
            title="Increment COunt"
            onPress={() => setCount(prev => prev + 1)}
            variant="secondary"
          />
        </View>
        <Text style={styles.buttonHint}>
          {isActive
            ? 'Camera is active and tracking your movements'
            : 'Press Start to begin tracking your push-ups'}
        </Text>
      </View>
    </View>
  );
}
