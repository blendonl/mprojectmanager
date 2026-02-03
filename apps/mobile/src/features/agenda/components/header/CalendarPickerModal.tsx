import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface CalendarPickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  visible,
  selectedDate,
  onClose,
  onDateSelect,
}) => {
  const [monthAnchor, setMonthAnchor] = useState(getMonthStart(selectedDate));

  const monthGridDays = useMemo((): Date[] => {
    const start = getMonthStart(monthAnchor);
    const gridStart = getMonday(start);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [monthAnchor]);

  const goToPreviousMonth = () => {
    const prev = new Date(monthAnchor);
    prev.setMonth(prev.getMonth() - 1);
    setMonthAnchor(getMonthStart(prev));
  };

  const goToNextMonth = () => {
    const next = new Date(monthAnchor);
    next.setMonth(next.getMonth() + 1);
    setMonthAnchor(getMonthStart(next));
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const monthLabel = monthAnchor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <AppIcon name="arrow-left" size={20} color={theme.text.primary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <AppIcon name="arrow-right" size={20} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {DAYS_SHORT.map(day => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <ScrollView style={styles.gridScroll}>
            <View style={styles.grid}>
              {monthGridDays.map((date, index) => {
                const isOutside = date.getMonth() !== monthAnchor.getMonth();
                return (
                  <TouchableOpacity
                    key={`${date.toISOString()}-${index}`}
                    style={[
                      styles.dayCell,
                      isOutside && styles.dayCellOutside,
                      isSelected(date) && styles.dayCellSelected,
                      isToday(date) && !isSelected(date) && styles.dayCellToday,
                    ]}
                    onPress={() => {
                      onDateSelect(date);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isOutside && styles.dayNumberOutside,
                        isSelected(date) && styles.dayNumberSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: theme.background.secondary,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  gridScroll: {
    maxHeight: 300,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  dayCellOutside: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: theme.accent.primary,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: theme.accent.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  dayNumberOutside: {
    color: theme.text.muted,
  },
  dayNumberSelected: {
    color: theme.background.primary,
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  closeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
