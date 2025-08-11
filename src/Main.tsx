import React from 'react';
import '../global.css';
import { View } from 'react-native';
import PushUpCounter from './screens/PushUpCounter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Main = () => {
  return (
    <View className="flex-1">
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <PushUpCounter />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>
  );
};

export default Main;