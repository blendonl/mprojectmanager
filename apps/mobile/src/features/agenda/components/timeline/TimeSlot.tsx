import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { AgendaItemCardMinimal } from './AgendaItemCardMinimal';

interface TimeSlotProps {
  hour: number;
  label: string;
  items: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  hour,
  label,
  items,
  onItemPress,
  onToggleComplete,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{label}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.divider} />
        {items.length > 0 && (
          <View style={styles.items}>
            {items.map(item => (
              <AgendaItemCardMinimal
                key={item.id}
                item={item}
                onPress={() => onItemPress(item)}
                onToggleComplete={() => onToggleComplete(item)}
              />
            ))}
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
});
