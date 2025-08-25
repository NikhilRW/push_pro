import { Alert, Linking } from 'react-native';

export const useRequestCameraWithRationale = (
  requestPermission: () => Promise<boolean>,
) => {
  return {
    requestCameraWithRationale: async () => {
      try {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Camera Permission Required',
            'To count push-ups using the front camera, please enable camera access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        }
      } catch (err) {
        console.warn('Camera permission error:', err);
      }
    },
  };
};

export default useRequestCameraWithRationale;