import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from 'shared/types/Navigation';
import SplashScreen from 'splash-screen/screens/SplashScreen';
import PushUpCounter from 'pushup-counter/screens/PushUpCounter';
import { Platform } from 'react-native';
import Instructions from 'instructions/screens/Instructions';
import History from '@/features/pushup-history/screens/History';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack = ({ isLimitPassed }: { isLimitPassed: boolean }) => {
  const screenAfterSplashScreen = isLimitPassed
    ? 'PushupCounter'
    : 'Instructions';
  return (
    <Stack.Navigator
      initialRouteName={
        parseInt(Platform.Version.toString(), 10) >= 31
          ? screenAfterSplashScreen
          : 'Splash'
      }
      screenOptions={{ animation: 'fade', headerShown: false }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        initialParams={{ isLimitPassed }}
      />
      <Stack.Screen name="PushupCounter" component={PushUpCounter} />
      <Stack.Screen name="Instructions" component={Instructions} />
      <Stack.Screen name='History' component={History} />


    </Stack.Navigator>
  );
};

export default RootStack;
