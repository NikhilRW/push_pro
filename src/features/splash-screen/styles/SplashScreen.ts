import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    width: 150,
    height: 150,
    backgroundColor: '#FD9900',
  },
  image: {
    width: 150,
    height: 190,
    backgroundColor: '#FD9900',
    position: 'absolute',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    top: '49%',
    left: '50%',
    zIndex: 10,
  },
});
