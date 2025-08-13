import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import React from 'react';
import { styles } from '../styles/PushUpCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PermisssionRejectedCard = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.permissionBox}>
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={styles.permissionLoader}
        />
        <Text style={styles.permissionTitle}>Setting up Camera</Text>
        <Text style={styles.permissionSubtitle}>
          Please allow camera permission to continue
        </Text>
      </View>
    </View>
  );
};

export default PermisssionRejectedCard;
