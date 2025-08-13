import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { View, Text } from 'react-native';
import {
  FaceDetectionOptions,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePushupSharedVals } from '../hooks/usePushupSharedVals';
import { usePushupFrameProcessor } from '../hooks/usePushupFrameProcessor';
import { useWorkletJsFuncs } from '../hooks/useWorkletJsFuncs';
import { styles } from '../styles/PushUpCounter';
import {
  animatedTextStyle,
  animateOpacity,
  animatePulse,
  annouceCountAfterChange,
  findVideoFormat,
  flipTextFunc,
  getAnimatedPulseStyle,
  getVolumeIconName,
} from '../utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useStoragePermission } from '../hooks/useStoragePermission';
import Sound from 'react-native-sound';
import PermisssionRejectedCard from '../components/PermisssionRejectedCard';
import PushupCamera from '../components/PushupCamera';
import Header from '../components/Header';
import DebugCard from '../components/DebugCard';
import ControlButtons from '../components/ControlButtons';

export default function PushUpCounter() {
  const insets = useSafeAreaInsets();
  const pulseOpacity = useSharedValue(0);
  const [count, setCount] = useState(0);
  const [currentState, setCurrentState] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [lastFaceY, setLastFaceY] = useState(0);
  const [volume, setVolume] = useState<'mute' | 'high' | 'low'>('low');
  const volumeIconName = getVolumeIconName(volume);

  const whenLastMessageIncluded = useRef<{ lastCount: number }>({
    lastCount: 1,
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
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${animatedRotation.value}deg` },
      ],
      opacity: animatedOpacity.value,
    };
  });

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
    animatePulseFunc();
  }, []);


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
    annouceCountAfterChange(volume, count, sound, whenLastMessageIncluded);
  }, [count, volume]);

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

  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(
    getAnimatedPulseStyle(pulseOpacity),
    [pulseOpacity],
  );

  if (!device || !hasPermission) {
    return <PermisssionRejectedCard />;
  }

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      className="dark:bg-neutral-900"
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

      {/* Control Buttons */}
      <ControlButtons
        isActive={isActive}
        resetCounter={resetCounter}
        setVolume={setVolume}
        toggleActive={toggleActive}
        volume={volume}
        volumeIconName={volumeIconName}
      />
    </View>
  );
}
