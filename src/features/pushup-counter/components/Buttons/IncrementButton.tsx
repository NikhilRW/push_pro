import { Button } from 'react-native';
import React from 'react';

const IncrementButton = ({ onPress }: { onPress: () => void }) => {
  return <Button title="Increment Count" onPress={()=>onPress()} />;
};

export default IncrementButton;