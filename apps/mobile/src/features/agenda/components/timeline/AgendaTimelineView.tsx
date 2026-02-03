import React from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { theme } from '@shared/theme/colors';

interface AgendaTimelineViewProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const AgendaTimelineView: React.FC<AgendaTimelineViewProps> = ({
  children,
  refreshing = false,
  onRefresh,
}) => {
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
});
