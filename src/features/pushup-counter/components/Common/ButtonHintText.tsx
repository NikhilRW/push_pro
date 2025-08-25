import { Text } from 'react-native';
import React from 'react';
import { useThemedStyles } from 'pushup-counter/styles/PushUpCounter';

const ButtonHintText = ({ text }: { text: string }) => {
  const styles = useThemedStyles();
  return (
    <Text style={styles.buttonHint} className="mt-2 text-wrap">
      {`${text.split(' ')[0]} \n ${text.split(' ')[1] ?  text.split(' ')[1] : ''} `}
    </Text>
  );
};

export default ButtonHintText;
