import {
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Video } from 'react-native-video';
import { styles } from '../styles/SplashScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';
import Animated, { LinearTransition } from 'react-native-reanimated';
const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('PushupCounter', {});
    }, 4000);
  });

  return (
    <Animated.View  layout={LinearTransition.duration(50)} className="bg-[#FD9900] w-screen h-screen justify-center items-center">
      {!videoLoaded && (
        <Image
          style={styles.image}
          className="absolute -translate-x-1/2 -translate-y-1/2 top-[49%] left-1/2 z-[10]"
          source={require('../res/pngs/pushpro2.png')}
          resizeMode="cover"
        />
      )}
      <Video
        style={[styles.video]}
        controls={false}
        disableAudioSessionManagement
        repeat
        onPlaybackStateChanged={() => setVideoLoaded(true)}
        source={require('../res/mp4s/pushpro_3.mp4')}
      />
    </Animated.View>
  );
};

export default SplashScreen;