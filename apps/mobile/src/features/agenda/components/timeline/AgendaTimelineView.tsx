import React from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { theme } from '@shared/theme/colors';
import { EmptyTimelineState } from './EmptyTimelineState';

interface AgendaTimelineViewProps {
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyStateLabel?: string;
  emptyStateIsToday?: boolean;
  onScheduleTask?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const AgendaTimelineView: React.FC<AgendaTimelineViewProps> = ({
  children,
  isEmpty = false,
  emptyStateLabel,
  emptyStateIsToday = false,
  onScheduleTask,
  refreshing = false,
  onRefresh,
}) => {
  if (isEmpty && emptyStateLabel && onScheduleTask) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContentContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent.primary}
              colors={[theme.accent.primary]}
            />
          ) : undefined
        }
      >
        <EmptyTimelineState
          dateLabel={emptyStateLabel}
          isToday={emptyStateIsToday}
          onScheduleTask={onScheduleTask}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  emptyContentContainer: {
    flex: 1,
  },
});
