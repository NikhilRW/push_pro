import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  historyButton: {
    position: 'absolute',
    right: '5%',
    top: '46%',
    transform: [
      {
        translateY: '-50%',
      },
    ],
    backgroundColor: '#0C4251',
    padding: 10,
    borderRadius: 60,
  },
});
