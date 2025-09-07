import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'shared/hooks/useThemeColors';

interface SaveButtonProps {
  onPress: () => void;
  disabled?: boolean;
  count: number;
  duration: number;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress, disabled, count, duration }) => {
  const themeColors = useThemeColors();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? themeColors.muted : themeColors.primary,
          shadowColor: themeColors.shadow,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: disabled ? themeColors.mutedText : '#FFFFFF' }]}>
        Save Session
      </Text>
      {!disabled && (
        <Text style={[styles.statsText, { color: '#FFFFFF' }]}>
          {count} pushups • {formatDuration(duration)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    opacity: 0.8,
  },
});

export default SaveButton;