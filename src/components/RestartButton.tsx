import { ButtonVariantsType } from '../types/PushupCounter';
import NeuromorphicButton from './NeuromorphicButton';
import { View } from 'react-native';

export const RestartButton = ({
  onPress,
}: {
  title: string;
  variant: ButtonVariantsType;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const svgSource = require('../res/svgs/refresh.svg');
  return (
    <View className="flex-1 pt-2">
      <NeuromorphicButton
        baseColor="#16414F"
        borderColor="#16414F"
        height={80}
        width={90}
        onPress={onPress}
        svgSource={svgSource}
      />
    </View>
  );
};