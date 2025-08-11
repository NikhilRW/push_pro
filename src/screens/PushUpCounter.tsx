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
import { StatusCard } from '../components/StatusCard';
import { styles } from '../styles/PushUpCounter';
import {
  annouceCountAfterChange,
  changeVolume,
  flipTextFunc,
  newGetStateColor,
  newGetStateText,
} from '../utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useStoragePermission } from '../hooks/useStoragePermission';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import Sound from 'react-native-sound';
import { height, width } from '../constants';
import { VolumeButton } from '../components/VolumeButton';
import { PlayPauseButton } from '../components/PlayPauseButton';
import { RestartButton } from '../components/RestartButton';
import {
  Canvas,
  Group,
  rect,
  RoundedRect,
  rrect,
  Shadow,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import {
  darkInnerBottomRightShadowColor,
  darkInnerBottomRightShadowColorForButtonBox,
  darkInnerTopLeftShadowColor,
  darkInnerTopLeftShadowColorForButtonBox,
  darkOuterTopLeftShadowColorForButtonBox,
} from '../constants/colors';

export default function PushUpCounter() {
  const insets = useSafeAreaInsets();
  const pulseOpacity = useSharedValue(0);
  const [count, setCount] = useState(0);
  const [currentState, setCurrentState] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [lastFaceY, setLastFaceY] = useState(0);
  const [volume, setVolume] = useState<'mute' | 'high' | 'low'>('low');
  const volumeIconName =
    volume === 'high'
      ? 'volume-up'
      : volume === 'mute'
        ? 'volume-off'
        : 'volume-down';

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

  // Breathing Pulse Animation
  const animatePulse = useCallback(() => {
    pulseOpacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.bezierFn(0.42, 0, 0.58, 1),
      }),
      Infinity,
      true,
    );
  }, [pulseOpacity]);

  const animatedRotation = useSharedValue(0);
  const animatedOpacity = useSharedValue(1);
  const [displayedCount, setDisplayedCount] = useState(count);

  // Animated style for flipping and fading
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${animatedRotation.value}deg` },
    ],
    opacity: animatedOpacity.value,
  }));

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
    animatedOpacity.value = withSequence(
      withTiming(0.5, { duration: 120 }),
      withTiming(1, { duration: 180 }),
    );
  }, [count, animatedOpacity]);

  useEffect(() => {
    animatePulse();
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
    annouceCountAfterChange(volume, count, sound, whenLastMessageIncluded);
  }, [animatePulse, count, volume]);

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

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  }, [pulseOpacity]);

  // const font = useFont(require('../res/fonts/impact/impact.ttf'), 44, err => {
  //   console.log(err);
  // });

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
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      className="dark:bg-neutral-900"
    >
      {/* <StatusBar barStyle="light-content" backgroundColor="#111827" /> */}
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
      <View style={styles.headerContainer}>
        <Canvas style={styles.headerBox}>
          <Group>
            <RoundedRect
              color={'#0B0F18'}
              rect={rrect(rect(0, 0, width * 0.94, height * 0.075), 30, 30)}
            />
            <Shadow
              dx={7}
              dy={7}
              color={darkInnerTopLeftShadowColor}
              blur={4}
              inner
            />
            <Shadow
              dx={-7}
              dy={-7}
              color={darkInnerBottomRightShadowColor}
              blur={4}
              inner
            />
          </Group>
        </Canvas>
        <View style={styles.stateRow}>
          <Animated.View
            style={[
              styles.stateDot,
              { backgroundColor: newGetStateColor(currentState) },
              pulseAnimatedStyle,
            ]}
          />
          <Text style={styles.stateText}>{newGetStateText(currentState)}</Text>
        </View>
      </View>

      {/* </View> */}
      {/* Main Counter */}
      <View style={styles.counterContainer}>
        {/* <View style={styles.counterBox}> */}
        <Animated.View style={[animatedStyle]}>
          <Text style={styles.countText}>{displayedCount}</Text>
        </Animated.View>
      </View>
      {/* Status Cards */}
      {debugMode && (
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
      )}
      {/* Control Buttons */}
      <View style={styles.buttonBox}>
        <Canvas style={{ flex: 1 }}>
          <Group>
            <RoundedRect
              color={'#0B0F18'}
              rect={rrect(
                rect(width * 0.045, height * 0.02, width * 0.91, height * 0.2),
                20,
                20,
              )}
            />
            <Shadow
              dx={4.5}
              dy={4.5}
              color={darkInnerTopLeftShadowColorForButtonBox}
              blur={2}
              inner
            />
            <Shadow
              dx={-4.5}
              dy={-4.5}
              color={darkOuterTopLeftShadowColorForButtonBox}
              blur={5}
            />
            <Shadow
              dx={7}
              dy={7}
              color={darkInnerBottomRightShadowColorForButtonBox}
              blur={4}
            />
          </Group>
        </Canvas>
        <View className="absolute" style={styles.buttonBoxContianer}>
          <View style={styles.buttonRow}>
            <RestartButton
              title="Reset"
              onPress={resetCounter}
              variant="success"
            />
            <PlayPauseButton
              onPress={() => toggleActive()}
              variant={isActive ? 'danger' : 'primary'}
            />
            <VolumeButton
              title="Reset"
              onPress={() => changeVolume(volume, setVolume)}
              variant="warning"
            >
              <FontAwesome5
                name={volumeIconName}
                iconStyle="solid"
                size={width * 0.09}
                color={'white'}
              />
            </VolumeButton>
          </View>
          <Text style={styles.buttonHint}>
            {isActive
              ? 'Camera is active and tracking your movements'
              : 'Press Start to begin tracking your push-ups'}
          </Text>
        </View>
        {/* <Button title="increment count" onPress={() => setCount(count + 1)} /> */}
      </View>
    </View>
  );
}