import { Alert } from 'react-native';
import { motivationalMessages } from '../constants';
import RNFS from 'react-native-fs';
import { ELEVENLABS_API_KEY } from '@env';
import Sound from 'react-native-sound';
import { Buffer } from 'buffer';
import { VolumeType } from '../types/PushupCounter';
import { ToWords } from 'to-words';
import RNHapticFeedback from 'react-native-haptic-feedback';

const toWords = new ToWords();

export const speakUsingElevenLabs = (
  count: number,
  whenLastMessageIncluded: React.RefObject<{
    lastCount: number;
  }>,
  isMotivationPlaying: boolean,
  volume: VolumeType,
): (() => Promise<{ sound: Sound; motivation: boolean } | null>) => {
  // This function returns a Promise that resolves to either an object with sound and motivation, or null.
  // It should never return 'void' to match the expected type.

  return async () => {
    const differenceInCount = count - whenLastMessageIncluded.current.lastCount;
    const isMessageShouldBeIncluded =
      differenceInCount >= 5 && differenceInCount <= 10;
    try {
      if (count > 40) {
        let message = '';
        let isMotivation = false;
        if (
          volume === 'high' &&
          isMessageShouldBeIncluded &&
          (Math.floor(Math.random() * 10 + 5) === differenceInCount ||
            differenceInCount === 10)
        ) {
          whenLastMessageIncluded.current.lastCount = count;
          message =
            `${toWords.convert(count)} ` +
            motivationalMessages[
              Math.floor(Math.random() * motivationalMessages.length)
            ];
          isMotivation = true;
        } else {
          message = `${toWords.convert(count)}`;
          isMotivation = false;
        }
        const response = await fetch(
          `https://api.elevenlabs.io//v1/text-to-speech/ZthjuvLPty3kTMaNKVKb?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              Accept: 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: message,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
              },
            }),
          },
        );
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = RNFS.DocumentDirectoryPath + '/tts_audio.mp3';
        const dirPath = RNFS.DocumentDirectoryPath;
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
        await RNFS.writeFile(path, buffer.toString('base64'), 'base64');
        const sound = new Sound(path, '', error => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          if (!isMotivationPlaying) {
            sound.play();
          }
        });
        return { sound: sound, motivation: isMotivation };
      } else {
        if (
          volume === 'high' &&
          isMessageShouldBeIncluded &&
          (Math.floor(Math.random() * 5 + 1) === differenceInCount ||
            differenceInCount === 5)
        ) {
          console.log(volume === 'high');
          whenLastMessageIncluded.current.lastCount = count;
          const newSound = new Sound(
            'message' + Math.floor(Math.random() * motivationalMessages.length),
            Sound.MAIN_BUNDLE,
            error_2 => {
              if (error_2) {
                console.log('Failed to load the sound', error_2);
                return;
              }
              newSound.play();
            },
          );
          return { sound: newSound, motivation: true };
        } else {
          const sound = new Sound('audio' + count, Sound.MAIN_BUNDLE, error => {
            if (error) {
              console.log('Failed to load the sound', error);
              return;
            }
            if (!isMotivationPlaying) {
              sound.play();
            }
          });
          return { sound: sound, motivation: false };
        }
      }
    } catch (err) {
      console.error('TTS speakText error', err);
      Alert.alert('Error', 'Something went wrong during TTS');
      return null;
    }
  };
};

export const annouceCountAfterChange = (
  volume: VolumeType,
  count: number,
  sound: React.RefObject<{
    sound: Sound | null;
    motivation: boolean;
  }>,
  whenLastMessageIncluded: React.RefObject<{
    lastCount: number;
  }>,
) => {
  if (volume !== 'mute' && count !== 0) {
    (async () => {
      const response = await speakUsingElevenLabs(
        count,
        whenLastMessageIncluded,
        sound.current.motivation && sound.current.sound!.isPlaying(),
        volume,
      )()!;
      if (response !== null) {
        sound.current.sound = response.sound;
        sound.current.motivation = response.motivation;
      }
    })();
  } else {
    sound.current.sound?.stop();
    sound.current.sound?.release();
  }
  RNHapticFeedback.trigger('notificationSuccess', {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  });
};
