import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { AgendaItemCardMinimal } from './AgendaItemCardMinimal';

interface TimeSlotEnhancedProps {
  hour: number;
  label: string;
  items: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

const MAX_ITEMS_PER_SLOT = 3;

export const TimeSlotEnhanced: React.FC<TimeSlotEnhancedProps> = ({
  hour,
  label,
  items,
  onItemPress,
  onToggleComplete,
}) => {
  const visibleItems = items.slice(0, MAX_ITEMS_PER_SLOT);
  const remainingCount = items.length - MAX_ITEMS_PER_SLOT;

  return (
    <View style={styles.container}>
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{label}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.divider} />
        {items.length > 0 && (
          <View style={styles.items}>
            {visibleItems.map(item => (
              <AgendaItemCardMinimal
                key={item.id}
                item={item}
                onPress={() => onItemPress(item)}
                onToggleComplete={() => onToggleComplete(item)}
              />
            ))}
            {remainingCount > 0 && (
              <View style={styles.moreIndicator}>
                <Text style={styles.moreText}>+{remainingCount} more</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
  },
  timeLabel: {
    width: 60,
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  content: {
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
  items: {
    paddingTop: 12,
    paddingLeft: 8,
    paddingRight: 8,
  },
  moreIndicator: {
    height: 24,
    backgroundColor: theme.background.elevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.secondary,
  },
});
