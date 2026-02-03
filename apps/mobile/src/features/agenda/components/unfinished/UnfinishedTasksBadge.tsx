import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface UnfinishedTasksBadgeProps {
  count: number;
  onPress: () => void;
  bottom: number;
}

export const UnfinishedTasksBadge: React.FC<UnfinishedTasksBadgeProps> = ({
  count,
  onPress,
  bottom,
}) => {
  if (count === 0) {
    return null;
  }

  const badgeHitSlop = { top: 6, right: 6, bottom: 6, left: 6 };

  return (
    <TouchableOpacity
      style={[styles.badge, { bottom: bottom + 70 }]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={badgeHitSlop}
      accessibilityLabel={`${count} unfinished ${count === 1 ? 'task' : 'tasks'}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view unfinished tasks"
    >
      <AppIcon name="alert" size={14} color={theme.background.primary} />
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count > 9 ? '9+' : count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.status.warning,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.status.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.background.primary,
  },
});
