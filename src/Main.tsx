import React, { useEffect } from 'react';
import '../global.css';
import { Platform, View } from 'react-native';
import PushUpCounter from './screens/PushUpCounter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import SplashScreen from 'react-native-splash-screen';

const Main = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const androidApiLevel = Platform.Version;
      if (androidApiLevel < 31) {
        // SplashScreen.hide();
      }
    }
  }, []);
  return (
    <View className="flex-1">
      <SafeAreaProvider>
          <PushUpCounter />
      </SafeAreaProvider>
    </View>
  );
};

export default Main;