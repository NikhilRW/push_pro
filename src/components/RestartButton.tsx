import NeuromorphicButton from './NeuromorphicButton';
import { View } from 'react-native';

export const RestartButton = ({
  onPress,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const svgSource = require('../res/svgs/refresh.svg');
  const height = 80;
  const width = 90;
  return (
    <View className="pt-2" style={{height,width}}>
      <NeuromorphicButton
        baseColor="#16414F"
        height={height}
        width={width}
        onPress={onPress}
        svgSource={svgSource}
      />
    </View>
  );
};