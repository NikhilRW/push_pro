import React, { useEffect, useState } from 'react';
import { Video } from 'react-native-video';
import { styles } from 'splash-screen/styles/SplashScreen';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from 'shared/types/Navigation';
import Animated, { LinearTransition } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { params } =
    useRoute<RouteProp<Record<string, RootStackParamList['Splash']>, string>>();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate(
        params.isLimitPassed ? 'PushupCounter' : 'Instructions',
        {},
      );
    }, 4000);
  });

  return (
    <Animated.View
      layout={LinearTransition.duration(50)}
      className="bg-[#FD9900] w-screen h-screen justify-center items-center"
    >
      {!videoLoaded && (
        <FastImage
          style={{columnGap:1}}
          className=""
          source={require('res/pngs/pushpro3.png')}
          resizeMode="cover"
        />
      )}
      <Video
        style={[styles.video]}
        controls={false}
        disableAudioSessionManagement
        repeat
        onPlaybackStateChanged={() => setVideoLoaded(true)}
        source={require('res/mp4s/pushpro_2.mp4')}
      />
    </Animated.View>
  );
};

export default SplashScreen;