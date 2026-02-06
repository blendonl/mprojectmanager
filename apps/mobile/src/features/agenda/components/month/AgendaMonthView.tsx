import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto, AgendaMonthViewDto } from 'shared-types';
import { spacing } from '@shared/theme/spacing';
import theme from '@shared/theme/colors';
import { getItemTitle } from '../../utils/agendaHelpers';

interface AgendaMonthViewProps {
  view: AgendaMonthViewDto;
  onDayPress: (dateKey: string) => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
}

export const AgendaMonthView: React.FC<AgendaMonthViewProps> = ({
  view,
  onDayPress,
  onItemPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {view.weekdayLabels.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {view.days.map((day) => (
          <TouchableOpacity
            key={day.dateKey}
            style={[
              styles.dayCell,
              !day.isCurrentMonth && styles.dayCellOutside,
            ]}
            onPress={() => onDayPress(day.dateKey)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${day.dateKey}`}
          >
            <View style={styles.dayHeader}>
              <Text
                style={[
                  styles.dayNumber,
                  day.isToday && styles.dayNumberToday,
                  !day.isCurrentMonth && styles.dayNumberOutside,
                ]}
              >
                {day.label}
              </Text>
            </View>
            <View style={styles.dayItems}>
              {day.items.map((item) => {
                const title = getItemTitle(item);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemChip}
                    onPress={() => onItemPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={title}
                  >
                    <Text style={styles.itemText} numberOfLines={1}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {day.overflowCount > 0 && (
                <Text style={styles.moreText}>{`+${day.overflowCount} more`}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    padding: 6,
    minHeight: 80,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.secondary,
  },
  dayCellOutside: {
    backgroundColor: theme.background.elevated,
    opacity: 0.6,
  },
  dayHeader: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.primary,
  },
  dayNumberToday: {
    color: theme.accent.primary,
  },
  dayNumberOutside: {
    color: theme.text.muted,
  },
  dayItems: {
    gap: 2,
  },
  itemChip: {
    backgroundColor: theme.card.background,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.card.border,
  },
  itemText: {
    fontSize: 9,
    color: theme.text.primary,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 9,
    color: theme.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
