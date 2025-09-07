import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Alert } from 'react-native';
import { useDatabase } from 'shared/context/DatabaseContext';
import { PushupLog } from 'shared/types/database';
import { format } from 'date-fns';
import { useThemeColors } from 'shared/hooks/useThemeColors';
import { styles } from 'pushup-history/styles/History';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const History: React.FC = () => {
  const {
    pushupLogs,
    databaseStats,
    isLoading,
    error,
    refreshData,
    deletePushupLog,
  } = useDatabase();
  const themeColors = useThemeColors();

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleDeleteLog = async (id: number) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this pushup log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await deletePushupLog(id);
            refreshData();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderLogItem = ({ item }: { item: PushupLog }) => (
    <View
      style={[
        styles.logItem,
        { backgroundColor: themeColors.history.cardBackground },
      ]}
    >
      <View style={styles.logContent}>
        <TouchableOpacity
          onPress={() => handleDeleteLog(item.id)}
          style={[
            styles.deleteButton,
            { backgroundColor: themeColors.history.deleteIcon.backgroundColor },
          ]}
        >
          <MaterialIcons
            name="delete-outline"
            color={themeColors.history.deleteIcon.color}
            size={20}
          />
        </TouchableOpacity>
        <Text
          style={[styles.dateText, { color: themeColors.history.text.date }]}
        >
          {formatDate(item.date)}
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Pushups:
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: themeColors.history.text.count },
              ]}
            >
              {item.pushup_count}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Duration:
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: themeColors.history.text.duration },
              ]}
            >
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text
        style={[
          styles.headerTitle,
          { color: themeColors.history.text.primary },
        ]}
      >
        Pushup History
      </Text>

      {databaseStats && (
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.statCardValue,
                { color: themeColors.history.text.count },
              ]}
            >
              {databaseStats.totalPushups}
            </Text>
            <Text
              style={[
                styles.statCardLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Total Pushups
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.statCardValue,
                { color: themeColors.history.text.count },
              ]}
            >
              {databaseStats.totalSessions}
            </Text>
            <Text
              style={[
                styles.statCardLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Total Sessions
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.statCardValue,
                { color: themeColors.history.achievement },
              ]}
            >
              {databaseStats.averagePerSession}
            </Text>
            <Text
              style={[
                styles.statCardLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Average Pushups
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.statCardValue,
                { color: themeColors.history.achievement },
              ]}
            >
              {databaseStats.maxPushupCount}
            </Text>
            <Text
              style={[
                styles.statCardLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Max Pushups
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          { color: themeColors.history.text.secondary },
        ]}
      >
        No pushup logs yet.
      </Text>
      <Text
        style={[
          styles.emptySubtext,
          { color: themeColors.history.text.secondary },
        ]}
      >
        Start tracking your pushups to see your history here!
      </Text>
    </View>
  );

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <Text style={[styles.errorText]}>Error: {error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
          onPress={refreshData}
        >
          <Text
            style={[styles.retryButtonText, { color: themeColors.background }]}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FlatList
        data={pushupLogs}
        keyExtractor={item => item.id.toString()}
        renderItem={renderLogItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default History;