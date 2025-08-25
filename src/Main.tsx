import '../global.css';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from 'shared/navigation/RootStack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'shared/context/ThemeContext';
import { StatusBar } from 'react-native';
import { useTheme } from 'shared/context/ThemeContext';
import { checkTimesAppOpenedPassedLimit } from 'shared/utils/app-initialization';
import { useEffect, useState } from 'react';

const MainContent = () => {
  const { isDark } = useTheme();
  const [isLimitPassed, setIsLimitPassed] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      setIsLimitPassed(await checkTimesAppOpenedPassedLimit());
    })();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#FFFFFF'}
      />
      <NavigationContainer>
        <RootStack isLimitPassed={isLimitPassed} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const Main = () => {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
};

export default Main;
