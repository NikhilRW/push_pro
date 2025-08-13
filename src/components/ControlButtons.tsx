import { View, Text } from 'react-native';
import React, { useMemo } from 'react';
import {
  Canvas,
  Group,
  rect,
  RoundedRect,
  rrect,
  Shadow,
} from '@shopify/react-native-skia';
import { styles } from '../styles/PushUpCounter';
import { RestartButton } from './RestartButton';
import { PlayPauseButton } from './PlayPauseButton';
import { VolumeButton } from './VolumeButton';
import { changeVolume } from '../utils';
import { height, width } from '../constants';
import {
  darkInnerBottomRightShadowColorForButtonBox,
  darkInnerTopLeftShadowColorForButtonBox,
  darkOuterTopLeftShadowColorForButtonBox,
} from '../constants/colors';
import { VolumeIconType, VolumeType } from '../types/PushupCounter';

const ControlButtons = ({
  resetCounter,
  isActive,
  toggleActive,
  volumeIconName,
  setVolume,
  volume,
}: {
  resetCounter: () => void;
  toggleActive: () => void;
  isActive: boolean;
  volumeIconName: VolumeIconType;
  volume: VolumeType;
  setVolume: React.Dispatch<React.SetStateAction<VolumeType>>;
}) => {
  const roundedRect = useMemo(
    () =>
      rrect(
        rect((width * 0.1) / 4, height * 0.02, width * 0.9, height * 0.2),
        20,
        20,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height],
  );

  return (
    <View style={styles.buttonBox}>
      <Canvas style={styles.flex_1}>
        <Group>
          <RoundedRect color={'#0B0F18'} rect={roundedRect} />
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
          <RestartButton title="Reset" onPress={resetCounter} />
          <PlayPauseButton
            onPress={() => toggleActive()}
            variant={isActive ? 'danger' : 'primary'}
          />
          <VolumeButton
            onPress={() => changeVolume(volume, setVolume)}
            volumeIconName={volumeIconName}
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
};

export default ControlButtons;
