import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PerformanceMetrics {
  fps: number;
  bufferSize: number;
  analysisTime: number;
  frameProcessingTime: number;
  memoryUsage: number;
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  isVisible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  isVisible = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Monitor</Text>
        <Text
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>FPS:</Text>
          <Text
            style={[
              styles.metricValue,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                color:
                  metrics.fps > 25
                    ? '#4CAF50'
                    : metrics.fps > 15
                      ? '#FF9800'
                      : '#F44336',
              },
            ]}
          >
            {metrics.fps.toFixed(1)}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Buffer:</Text>
          <Text style={styles.metricValue}>{metrics.bufferSize}</Text>
        </View>

        {isExpanded && (
          <>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Analysis:</Text>
              <Text style={styles.metricValue}>
                {metrics.analysisTime.toFixed(1)}ms
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Frame Proc:</Text>
              <Text style={styles.metricValue}>
                {metrics.frameProcessingTime.toFixed(1)}ms
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Memory:</Text>
              <Text style={styles.metricValue}>
                {metrics.memoryUsage.toFixed(1)}MB
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  metricsContainer: {
    gap: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
