import { View } from 'react-native';
import { RestartButton } from 'pushup-counter/components/Buttons/RestartButton';
import { PlayPauseButton } from 'pushup-counter/components/Buttons/PlayPauseButton';
import { VolumeButton } from 'pushup-counter/components/Buttons/VolumeButton';
import { changeVolume, getVolumeIcon } from 'pushup-counter/utils';
import { VolumeType } from 'pushup-counter/types/PushupCounter';
import { useThemedStyles } from 'pushup-counter/styles/PushUpCounter';
import ButtonBackground from 'pushup-counter/components/Common/ButtonBackground';
import { memo, useMemo } from 'react';
import ButtonHintText from 'pushup-counter/components/Common/ButtonHintText';

const ControlButtons = memo(
  ({
    resetCounter,
    isActive,
    toggleActive,
    setVolume,
    volume,
  }: {
    resetCounter: () => void;
    toggleActive: () => void;
    isActive: boolean;
    volume: VolumeType;
    setVolume: React.Dispatch<React.SetStateAction<VolumeType>>;
  }) => {
    const styles = useThemedStyles();
    const volumeIcon = useMemo(() => getVolumeIcon(volume), [volume]);

    const ButtonsGroup = useMemo(
      () => (
        <View className="absolute" style={styles.buttonBoxContianer}>
          <View style={styles.buttonRow}>
            <View className="flex-col justify-center items-center">
              <RestartButton title="Reset" onPress={resetCounter} />
              <ButtonHintText text={'Reset'} />
            </View>
            <View className="flex-col">
              <PlayPauseButton
                onPress={() => toggleActive()}
                variant={isActive ? 'danger' : 'primary'}
              />
              <ButtonHintText
                text={isActive ? 'Stop Counting' : 'Start Counting'}
              />
            </View>
            <View className="flex-col justify-center items-center">
              <VolumeButton
                onPress={() => changeVolume(volume, setVolume)}
                volumeIcon={volumeIcon}
              />
              <ButtonHintText text={'Count Sound'} />
            </View>
          </View>
        </View>
      ),
      [
        isActive,
        resetCounter,
        setVolume,
        styles.buttonBoxContianer,
        styles.buttonRow,
        toggleActive,
        volume,
        volumeIcon,
      ],
    );

    return (
      <View style={styles.buttonBox} className="relative">
        <View className="w-full h-full absolute left-1/2 -translate-x-[50%]">
          <ButtonBackground />
          {ButtonsGroup}
        </View>
      </View>
    );
  },
  (prev, next) => {
    return prev.isActive === next.isActive && prev.volume === next.volume;
  },
);

export default ControlButtons;
