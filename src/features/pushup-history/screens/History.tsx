import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Alert } from 'react-native';
import { useDatabase } from 'shared/context/DatabaseContext';
import { PushupLog } from 'shared/types/database';
import { format } from 'date-fns';
import { useThemeColors } from 'shared/hooks/useThemeColors';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import IonIcons from '@react-native-vector-icons/ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/shared/types';

// const { width } = Dimensions.get('window');

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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    refreshData();
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return format(date, 'MMM dd');
  };

  const getProgressColor = (count: number, maxCount: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    if (percentage >= 40) return '#2196F3'; // Blue
    return '#9E9E9E'; // Gray
  };

  const getMotivationalMessage = (count: number, maxCount: number) => {
    if (count === maxCount) return '🔥 Personal Best!';
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return '💪 Amazing!';
    if (percentage >= 60) return '⭐ Great job!';
    if (percentage >= 40) return '👍 Keep going!';
    return '🌱 Getting started!';
  };

  const handleDeleteLog = async (id: number) => {
    Alert.alert(
      'Delete This Workout? 🗑️',
      'This will permanently remove this workout from your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePushupLog(id);
            refreshData();
          },
        },
      ],
    );
  };

  const handleExitPress = () => {
    navigation.navigate('PushupCounter', {});
  };

  const renderLogItem = ({ item }: { item: PushupLog; index: number }) => {
    const progressColor = getProgressColor(
      item.pushup_count,
      databaseStats?.maxPushupCount || item.pushup_count,
    );
    const motivationalMsg = getMotivationalMessage(
      item.pushup_count,
      databaseStats?.maxPushupCount || item.pushup_count,
    );

    return (
      <Animated.View
        style={[
          styles.logItemContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.logItem,
            {
              backgroundColor: themeColors.history.cardBackground,
              borderLeftColor: progressColor,
            },
          ]}
        >
          {/* Header with date and delete */}
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Text
                style={[
                  styles.dateText,
                  { color: themeColors.history.text.primary },
                ]}
              >
                {formatDate(item.date)}
              </Text>
              <Text style={[styles.motivationText, { color: progressColor }]}>
                {motivationalMsg}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteLog(item.id)}
              style={[
                styles.deleteButton,
                { backgroundColor: themeColors.history.cardBackground },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="delete-outline"
                color={themeColors.history.text.secondary}
                size={20}
              />
            </TouchableOpacity>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressCircle,
                { borderColor: progressColor + '30' },
              ]}
            >
              <View
                style={[
                  styles.progressInner,
                  { backgroundColor: progressColor + '15' },
                ]}
              >
                <Text style={[styles.pushupCount, { color: progressColor }]}>
                  {item.pushup_count}
                </Text>
                <Text
                  style={[
                    styles.pushupLabel,
                    { color: themeColors.history.text.secondary },
                  ]}
                >
                  push-ups
                </Text>
              </View>
            </View>
          </View>

          {/* Duration with icon */}
          <View style={styles.durationContainer}>
            <View
              style={[
                styles.durationBadge,
                { backgroundColor: themeColors.primary + '15' },
              ]}
            >
              <MaterialIcons
                name="timer"
                size={14}
                color={themeColors.primary}
              />
              <Text
                style={[styles.durationText, { color: themeColors.primary }]}
              >
                {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleExitPress} style={styles.backButton}>
            <IonIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Fitness Journey 🚀</Text>
          <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Stats */}
        {databaseStats && (
          <View style={styles.heroStats}>
            <View style={styles.mainStatContainer}>
              <Text style={styles.heroNumber}>
                {databaseStats.totalPushups.toLocaleString()}
              </Text>
              <Text style={styles.heroLabel}>Total Push-ups Done! 💪</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      {databaseStats && (
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#4CAF50' + '15' }]}
            >
              <MaterialIcons name="fitness-center" size={24} color="#4CAF50" />
            </View>
            <Text
              style={[
                styles.statNumber,
                { color: themeColors.history.text.primary },
              ]}
            >
              {databaseStats.totalSessions}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Workouts Completed
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#2196F3' + '15' }]}
            >
              <MaterialIcons name="trending-up" size={24} color="#2196F3" />
            </View>
            <Text
              style={[
                styles.statNumber,
                { color: themeColors.history.text.primary },
              ]}
            >
              {Math.round(databaseStats.averagePerSession)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Average per Workout
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.history.cardBackground },
            ]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#FF9800' + '15' }]}
            >
              <MaterialIcons name="emoji-events" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>
              {databaseStats.maxPushupCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.history.text.secondary },
              ]}
            >
              Personal Best! 🏆
            </Text>
          </View>
        </View>
      )}

      {/* Section Title */}
      {pushupLogs && pushupLogs.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.history.text.primary },
            ]}
          >
            Recent Workouts ⚡
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: themeColors.history.text.secondary },
            ]}
          >
            Keep the momentum going!
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.emptyIllustration,
          { backgroundColor: themeColors.primary + '15' },
        ]}
      >
        <Text style={styles.emptyEmoji}>🏋️‍♂️</Text>
      </View>
      <Text
        style={[styles.emptyTitle, { color: themeColors.history.text.primary }]}
      >
        Ready to Start Your Journey?
      </Text>
      <Text
        style={[
          styles.emptyMessage,
          { color: themeColors.history.text.secondary },
        ]}
      >
        Your first workout is just a tap away! Let's build some strength
        together 💪
      </Text>
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: themeColors.primary }]}
        onPress={handleExitPress}
      >
        <MaterialIcons
          name="play-arrow"
          size={20}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.startButtonText}>Start Your First Workout</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.errorContainer}>
          <View
            style={[styles.errorIcon, { backgroundColor: '#ff4444' + '15' }]}
          >
            <Text style={styles.errorEmoji}>😅</Text>
          </View>
          <Text
            style={[
              styles.errorTitle,
              { color: themeColors.history.text.primary },
            ]}
          >
            Oops! Something went wrong
          </Text>
          <Text
            style={[
              styles.errorMessage,
              { color: themeColors.history.text.secondary },
            ]}
          >
            Don't worry, your progress is safe. Let's try loading it again!
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={refreshData}
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 30,
  },

  // Header
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroStats: {
    alignItems: 'center',
  },
  mainStatContainer: {
    alignItems: 'center',
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  heroLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  // Workout Cards
  logItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  logItem: {
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pushupCount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pushupLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  durationContainer: {
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorEmoji: {
    fontSize: 50,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});

export default History;
