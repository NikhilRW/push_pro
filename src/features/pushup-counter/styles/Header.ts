import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  header: {
    position: 'absolute',
    right: '22%',
    top: '51%',
    transform: [
      {
        translateY: '-50%',
      },
    ],
    backgroundColor: '#0E122B',
    padding: 10,
    borderRadius: 10,
  },
});
