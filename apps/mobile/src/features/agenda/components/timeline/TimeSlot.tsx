import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { TimeSlotOverflow } from './TimeSlotOverflow';
import AppIcon from '@shared/components/icons/AppIcon';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';

interface TimeSlotProps {
  hour: number;
  label: string;
  items: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  isWakeUpTime?: boolean;
  isSleepTime?: boolean;
  currentTimeOffset?: number;
}

export const TimeSlot = React.memo<TimeSlotProps>(
  ({
    hour,
    label,
    items,
    onItemPress,
    onToggleComplete,
    isWakeUpTime = false,
    isSleepTime = false,
    currentTimeOffset,
  }) => {
    const MAX_VISIBLE_ITEMS = 1;
    const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
    const hiddenItems = items.slice(MAX_VISIBLE_ITEMS);

    return (
      <View style={styles.container} pointerEvents="box-none">
        {currentTimeOffset !== undefined && (
          <CurrentTimeIndicator offsetY={currentTimeOffset} />
        )}
        <View style={styles.timeLabel} pointerEvents="none">
          <Text style={styles.timeLabelText}>{label}</Text>
          {isWakeUpTime && (
            <View style={styles.indicatorBadge}>
              <AppIcon name="sun" size={12} color={theme.accent.wake} />
            </View>
          )}
          {isSleepTime && (
            <View style={styles.indicatorBadge}>
              <AppIcon name="moon" size={12} color={theme.accent.sleep} />
            </View>
          )}
        </View>
        <View style={styles.content} pointerEvents="box-none">
          <View style={[
            styles.divider,
            (isWakeUpTime || isSleepTime) && styles.dividerHighlight
          ]} pointerEvents="none" />
          {items.length > 0 && (
            <View style={styles.items} pointerEvents="box-none">
              <TimeSlotOverflow
                hour={hour}
                visibleItems={visibleItems}
                hiddenItems={hiddenItems}
                onItemPress={onItemPress}
                onToggleComplete={onToggleComplete}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.hour === nextProps.hour &&
      prevProps.label === nextProps.label &&
      prevProps.isWakeUpTime === nextProps.isWakeUpTime &&
      prevProps.isSleepTime === nextProps.isSleepTime &&
      prevProps.currentTimeOffset === nextProps.currentTimeOffset &&
      prevProps.items.length === nextProps.items.length &&
      prevProps.items.every((item, idx) => item.id === nextProps.items[idx]?.id)
    );
  }
);

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
  indicatorBadge: {
    marginTop: 2,
    padding: 2,
    borderRadius: 4,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
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
  dividerHighlight: {
    height: 2,
    backgroundColor: theme.accent.primary,
  },
  items: {
    paddingTop: 12,
    paddingLeft: 8,
    paddingRight: 8,
  },
});
