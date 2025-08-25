import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from 'shared/types/Navigation';
import SplashScreen from 'splash-screen/screens/SplashScreen';
import PushUpCounter from 'pushup-counter/screens/PushUpCounter';
import { Platform } from 'react-native';
import Instructions from 'instructions/screens/Instructions';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack = ({ isLimitPassed }: { isLimitPassed: boolean }) => {
  return (
    <Stack.Navigator
      initialRouteName={
        Number(Platform.Version) >= 31
          ? isLimitPassed
            ? 'PushupCounter'
            : 'Instructions'
          : 'Splash'
      }
      screenOptions={{ animation: 'fade', headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PushupCounter" component={PushUpCounter} />
      <Stack.Screen name="Instructions" component={Instructions} />
    </Stack.Navigator>
  );
};

export default RootStack;