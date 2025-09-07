import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React from 'react';
import { useThemedStyles } from '../../styles/PushUpCounter';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

const SaveConfirmationModal = ({
  handleDiscardSession,
  handleSaveSession,
  showSaveModal,
  count,
  sessionDuration,
}: {
  showSaveModal: boolean;
  handleDiscardSession: () => void;
  handleSaveSession: () => Promise<void>;
  count: number;
  sessionDuration: number;
}) => {
  const styles = useThemedStyles();
  const themeColors = useThemeColors();
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSaveModal}
      onRequestClose={handleDiscardSession}
    >
      <View style={[styles.modalContainer]}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.history.cardBackground },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: themeColors.text.primary }]}
          >
            Save Session?
          </Text>
          <Text
            style={[styles.modalText, { color: themeColors.text.secondary }]}
          >
            Do you want to save this session?
          </Text>
          <Text
            style={[styles.modalStats, { color: themeColors.text.primary }]}
          >
            Pushups: {count} | Duration: {sessionDuration}s
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { backgroundColor: themeColors.border },
              ]}
              onPress={handleDiscardSession}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: themeColors.text.primary },
                ]}
              >
                Discard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={handleSaveSession}
            >
              <Text style={[styles.modalButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SaveConfirmationModal;
