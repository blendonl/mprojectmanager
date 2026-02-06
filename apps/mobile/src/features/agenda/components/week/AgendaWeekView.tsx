import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AgendaItemEnrichedDto, AgendaWeekViewDto } from 'shared-types';
import { spacing } from '@shared/theme/spacing';
import theme from '@shared/theme/colors';
import { AgendaItemCardMinimal } from '../timeline/AgendaItemCardMinimal';
import { AgendaWeekEventCard } from './AgendaWeekEventCard';

interface AgendaWeekViewProps {
  view: AgendaWeekViewDto;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onDayPress: (dateKey: string) => void;
}

const HOUR_SLOT_HEIGHT = 60;
const TIME_COLUMN_WIDTH = 52;
const MIN_EVENT_HEIGHT = 18;

export const AgendaWeekView: React.FC<AgendaWeekViewProps> = ({
  view,
  onItemPress,
  onItemLongPress,
  onDayPress,
}) => {
  const { width } = useWindowDimensions();
  const dayColumnWidth = useMemo(() => {
    const available = Math.max(0, width - TIME_COLUMN_WIDTH - spacing.lg * 2);
    return Math.max(44, available / 7);
  }, [width]);

  const gridHeight = view.hours.length * HOUR_SLOT_HEIGHT;
  const pxPerMinute = HOUR_SLOT_HEIGHT / 60;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.timeColumnHeader, { width: TIME_COLUMN_WIDTH }]} />
        <View style={styles.dayHeaderRow}>
          {view.days.map((day) => (
            <TouchableOpacity
              key={day.dateKey}
              style={[styles.dayHeaderCell, { width: dayColumnWidth }]}
              onPress={() => onDayPress(day.dateKey)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${day.shortLabel} ${day.label}`}
            >
              <Text style={[styles.dayHeaderText, day.isToday && styles.dayHeaderTextToday]}>
                {day.shortLabel}
              </Text>
              <Text style={[styles.dayHeaderDate, day.isToday && styles.dayHeaderDateToday]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.allDayRow}>
        <View style={[styles.timeColumnAllDay, { width: TIME_COLUMN_WIDTH }]}>
          <Text style={styles.allDayLabel}>All-day</Text>
        </View>
        <View style={styles.allDayColumns}>
          {view.days.map((day) => (
            <View key={day.dateKey} style={[styles.allDayCell, { width: dayColumnWidth }]}>
              {day.allDayItems.map((item) => (
                <AgendaItemCardMinimal
                  key={item.id}
                  item={item}
                  onPress={() => onItemPress(item)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridScrollContent}>
        <View style={styles.gridRow}>
          <View style={[styles.timeColumn, { width: TIME_COLUMN_WIDTH }]}>
            {view.hours.map((hour) => (
              <View key={`hour-${hour.hour}`} style={[styles.timeSlot, { height: HOUR_SLOT_HEIGHT }]}>
                <Text style={styles.timeLabel}>{hour.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.dayColumns}>
            {view.days.map((day) => (
              <View
                key={day.dateKey}
                style={[styles.dayColumn, { width: dayColumnWidth, height: gridHeight }]}
              >
                {view.hours.map((hour, index) => (
                  <View
                    key={`line-${day.dateKey}-${hour.hour}`}
                    style={[styles.hourDivider, { top: index * HOUR_SLOT_HEIGHT }]}
                  />
                ))}
                {day.timedItems.map((timed) => {
                  const top = timed.startMinute * pxPerMinute;
                  const height = Math.max(timed.durationMinutes * pxPerMinute, MIN_EVENT_HEIGHT);
                  const width = dayColumnWidth / timed.overlapCount;
                  const left = timed.overlapIndex * width;
                  return (
                    <AgendaWeekEventCard
                      key={timed.item.id}
                      item={timed.item}
                      onPress={() => onItemPress(timed.item)}
                      onLongPress={() => onItemLongPress(timed.item)}
                      style={{ top, height, width, left }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  timeColumnHeader: {
    paddingBottom: spacing.xs,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    flex: 1,
  },
  dayHeaderCell: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  dayHeaderText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  dayHeaderTextToday: {
    color: theme.accent.primary,
  },
  dayHeaderDate: {
    fontSize: 12,
    color: theme.text.primary,
    fontWeight: '700',
  },
  dayHeaderDateToday: {
    color: theme.accent.primary,
  },
  allDayRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  timeColumnAllDay: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  allDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  allDayColumns: {
    flexDirection: 'row',
    flex: 1,
  },
  allDayCell: {
    paddingHorizontal: 4,
  },
  gridScroll: {
    flex: 1,
  },
  gridScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gridRow: {
    flexDirection: 'row',
  },
  timeColumn: {
    paddingRight: spacing.xs,
  },
  timeSlot: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  timeLabel: {
    fontSize: 11,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  dayColumns: {
    flexDirection: 'row',
    flex: 1,
  },
  dayColumn: {
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: theme.border.secondary,
  },
  hourDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.border.primary,
  },
});
