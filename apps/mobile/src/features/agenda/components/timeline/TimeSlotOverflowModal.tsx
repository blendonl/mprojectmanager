import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';
import { AgendaItemCard } from '../AgendaItemCard';

interface TimeSlotOverflowModalProps {
  visible: boolean;
  hour: number;
  items: AgendaItemEnrichedDto[];
  onClose: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const TimeSlotOverflowModal: React.FC<TimeSlotOverflowModalProps> = ({
  visible,
  hour,
  items,
  onClose,
  onItemPress,
  onToggleComplete,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{formatHourLabel(hour)}</Text>
            <Text style={styles.subtitle}>
              {items.length} {items.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <AppIcon name="x" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map(item => (
            <AgendaItemCard
              key={item.id}
              item={item}
              onPress={() => {
                onItemPress(item);
                onClose();
              }}
              onToggleComplete={() => onToggleComplete(item)}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
});
