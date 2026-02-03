import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { AgendaItemCard } from '../AgendaItemCard';

interface SpecialItemsHeaderProps {
  wakeupItem: AgendaItemEnrichedDto | null;
  stepItem: AgendaItemEnrichedDto | null;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

export const SpecialItemsHeader: React.FC<SpecialItemsHeaderProps> = ({
  wakeupItem,
  stepItem,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
}) => {
  if (!wakeupItem && !stepItem) {
    return null;
  }

  return (
    <View style={styles.container}>
      {wakeupItem && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake up</Text>
          <AgendaItemCard
            item={wakeupItem}
            sleepMode="wakeup"
            onPress={() => onItemPress(wakeupItem)}
            onLongPress={() => onItemLongPress(wakeupItem)}
            onToggleComplete={() => onToggleComplete(wakeupItem)}
          />
        </View>
      )}
      {stepItem && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          <AgendaItemCard
            item={stepItem}
            onPress={() => onItemPress(stepItem)}
            onLongPress={() => onItemLongPress(stepItem)}
            onToggleComplete={() => onToggleComplete(stepItem)}
          />
        </View>
      )}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: theme.background.primary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border.primary,
    marginTop: spacing.sm,
  },
});
