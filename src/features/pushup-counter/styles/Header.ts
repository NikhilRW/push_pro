import { StyleSheet } from 'react-native';

export const createHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    historyButton: {
      position: 'absolute',
      right: '5%',
      top: '46%',
      opacity: 0.9,
      transform: [
        {
          translateY: '-50%',
        },
      ],
      padding: 10,
      borderRadius: 60,
      backgroundColor: isDark ? '#0C425180' : '#0186AB80',
    },
    instructionsButton: {
      position: 'absolute',
      left: '3.5%',
      opacity: 0.9,
      top: '46%',
      transform: [
        {
          translateY: '-50%',
        },
      ],
      padding: 10,
      borderRadius: 60,
      backgroundColor: isDark ? '#0C425180' : '#0186AB80',
    },
  });
