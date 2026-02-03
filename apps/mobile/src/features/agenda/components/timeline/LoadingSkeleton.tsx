import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonCard: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.cardContent}>
        <View style={styles.titleLine} />
        <View style={styles.metaLine} />
      </View>
      <View style={styles.statusCircle} />
    </Animated.View>
  );
};

const SkeletonTimeSlot: React.FC = () => {
  return (
    <View style={styles.timeSlot}>
      <View style={styles.timeLabel}>
        <View style={styles.timeLabelBox} />
      </View>
      <View style={styles.slotContent}>
        <View style={styles.divider} />
        <View style={styles.cardsArea}>
          <SkeletonCard />
        </View>
      </View>
    </View>
  );
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 8 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonTimeSlot key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  timeSlot: {
    height: 60,
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timeLabel: {
    width: 60,
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  timeLabelBox: {
    width: 40,
    height: 14,
    backgroundColor: theme.background.elevated,
    borderRadius: 4,
  },
  slotContent: {
    flex: 1,
    position: 'relative',
  },
  divider: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.border.primary,
  },
  cardsArea: {
    paddingTop: 12,
    paddingLeft: 8,
  },
  card: {
    height: 36,
    backgroundColor: theme.background.elevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  titleLine: {
    width: '70%',
    height: 12,
    backgroundColor: theme.border.primary,
    borderRadius: 4,
  },
  metaLine: {
    width: '40%',
    height: 8,
    backgroundColor: theme.border.primary,
    borderRadius: 4,
    marginTop: 4,
  },
  statusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.border.primary,
    marginLeft: 8,
  },
});
