import { View } from 'react-native';
import React from 'react';
import { StatusCard } from './StatusCard';
import { styles } from '../styles/PushUpCounter';

const DebugCard = ({
  bufferInfo,
  lastFaceY,
}: {
  lastFaceY: number;
  bufferInfo: {
    bufferSize: number;
    currentPattern: string;
    minY: number;
    maxY: number;
    range: number;
  };
}) => {
  return (
    <View style={styles.statusRow}>
      <StatusCard
        title="Face Position"
        value={lastFaceY ? lastFaceY.toFixed(0) : '---'}
        subtitle="Y coordinate"
      />
      <StatusCard
        title="Buffer Size"
        value={bufferInfo.bufferSize}
        subtitle={`Range: ${bufferInfo.range.toFixed(0)}`}
      />
    </View>
  );
};

export default DebugCard;
