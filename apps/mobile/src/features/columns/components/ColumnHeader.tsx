import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Column } from '../domain/entities/Column';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme';

interface ColumnHeaderProps {
  column: Column;
  taskCount: number;
  onMenuPress: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = React.memo(({
  column,
  taskCount,
  onMenuPress,
}) => {
  const isAtCapacity = column.limit !== null && taskCount >= column.limit;
  const isNearCapacity = column.limit !== null && taskCount >= column.limit * 0.8;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.colorIndicator, { backgroundColor: column.color }]} />
        <Text style={styles.title} numberOfLines={1}>
          {column.name}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {column.limit !== null && (
          <View
            style={[
              styles.wipLimitBadge,
              isAtCapacity && styles.wipLimitBadgeAtCapacity,
              isNearCapacity && !isAtCapacity && styles.wipLimitBadgeNearCapacity,
            ]}
          >
            <Text
              style={[
                styles.wipLimitText,
                (isAtCapacity || isNearCapacity) && styles.wipLimitTextWarning,
              ]}
            >
              {taskCount}/{column.limit}
            </Text>
          </View>
        )}

        {!column.limit && taskCount > 0 && (
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{taskCount}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

ColumnHeader.displayName = 'ColumnHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  wipLimitBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
  },
  wipLimitBadgeNearCapacity: {
    backgroundColor: theme.colors.warning + '20',
  },
  wipLimitBadgeAtCapacity: {
    backgroundColor: theme.colors.error + '20',
  },
  wipLimitText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  wipLimitTextWarning: {
    color: theme.colors.error,
  },
  taskCountBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '20',
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  menuButton: {
    padding: theme.spacing.xs,
  },
});

export default ColumnHeader;
