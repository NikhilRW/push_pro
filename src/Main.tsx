import React from 'react'
import '../global.css';
import { View } from 'react-native';
import PushUpCounter from './screens/PushUpCounter';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Main = () => {
  return (
    <View className='flex-1'>
      <SafeAreaProvider>
        <PushUpCounter />
      </SafeAreaProvider>
    </View>
  )
}

export default Main;