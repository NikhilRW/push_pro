import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import React from 'react';
import { useThemedStyles } from '../../styles/PushUpCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';

const PermisssionRejectedCard = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const themeColors = useThemeColors();
  const styles = useThemedStyles();
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />
      <View style={[styles.permissionBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <ActivityIndicator
          size="large"
          color={themeColors.button.primary}
          style={styles.permissionLoader}
        />
        <Text style={[styles.permissionTitle, { color: themeColors.text.primary }]}>
          Setting up Camera
        </Text>
        <Text style={[styles.permissionSubtitle, { color: themeColors.text.secondary }]}>
          Please allow camera permission to continue
        </Text>
      </View>
    </View>
  );
};

export default PermisssionRejectedCard;
