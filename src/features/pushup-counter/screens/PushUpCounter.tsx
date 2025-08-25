import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';
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
import IncrementButton from '../components/Buttons/IncrementButton';
import { useStoragePermission } from '../hooks/useStoragePermission';

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
    animatePulseFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const { hasStoragePermission, requestStoragePermission } = useStoragePermission();
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
    if (count !== whenLastMessageIncluded.current.lastCount) {
      if(await AccessibilityInfo.isAccessibilityServiceEnabled()){
        annouceCountAfterChange(volume==='mute'?'high':volume, count, sound, whenLastMessageIncluded);
      }
      else{
        annouceCountAfterChange(volume, count, sound, whenLastMessageIncluded);
      }
    }
    }
    main();
  }, [count, volume]);

  useEffect(()=>{
    const main = async () => {
      const screenReaderEnabled =  await AccessibilityInfo.isScreenReaderEnabled();
    if(screenReaderEnabled){
      AccessibilityInfo.announceForAccessibility('Push-up counter screen')
    }
    }
    main();
  },[]);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        requestCameraWithRationale();
      }
      if(!hasStoragePermission){
        requestStoragePermission();
      }
      
    })();
  }, [hasPermission, hasStoragePermission, requestCameraWithRationale, requestPermission, requestStoragePermission]);

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
    setIsActive(prev => !prev);
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(
    getAnimatedPulseStyle(pulseOpacity),
    [pulseOpacity],
  );

  const controlButtonsProps = useMemo(
    () => ({
      isActive,
      resetCounter,
      setVolume,
      toggleActive,
      volume,
    }),
    [isActive, resetCounter, setVolume, toggleActive, volume],
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

      <IncrementButton onPress={incrementCount} />
      {/* Control Buttons */}
      <ControlButtons {...controlButtonsProps} />
    </View>
  );
}
