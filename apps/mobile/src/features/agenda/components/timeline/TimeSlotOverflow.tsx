import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { AgendaItemCardMinimal } from './AgendaItemCardMinimal';
import { TimeSlotOverflowModal } from './TimeSlotOverflowModal';

interface TimeSlotOverflowProps {
  hour: number;
  visibleItems: AgendaItemEnrichedDto[];
  hiddenItems: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

export const TimeSlotOverflow: React.FC<TimeSlotOverflowProps> = ({
  hour,
  visibleItems,
  hiddenItems,
  onItemPress,
  onToggleComplete,
}) => {
  const [showModal, setShowModal] = useState(false);

  const allItems = [...visibleItems, ...hiddenItems];

  return (
    <>
      {visibleItems.map(item => (
        <AgendaItemCardMinimal
          key={item.id}
          item={item}
          onPress={() => onItemPress(item)}
          onToggleComplete={() => onToggleComplete(item)}
        />
      ))}

      {hiddenItems.length > 0 && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
          accessibilityLabel={`${hiddenItems.length} more ${hiddenItems.length === 1 ? 'task' : 'tasks'}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to view all tasks"
        >
          <Text style={styles.moreText}>+{hiddenItems.length} more</Text>
        </TouchableOpacity>
      )}

      <TimeSlotOverflowModal
        visible={showModal}
        hour={hour}
        items={allItems}
        onClose={() => setShowModal(false)}
        onItemPress={onItemPress}
        onToggleComplete={onToggleComplete}
      />
    </>
  );
};

const styles = StyleSheet.create({
  moreButton: {
    height: 28,
    backgroundColor: theme.background.elevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
});
