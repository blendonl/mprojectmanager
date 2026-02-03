import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import { getScheduledTime, isItemCompleted } from '../../utils/agendaHelpers';

interface AgendaItemCardMinimalProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
  onToggleComplete?: () => void;
}

const formatTime = (time: string | null | undefined) => {
  if (!time || typeof time !== 'string') return null;
  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return null;
  const hour = parseInt(hours, 10);
  if (Number.isNaN(hour)) return null;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getAccentColor = (item: AgendaItemEnrichedDto): string => {
  const taskType = item.task?.taskType;
  const isRoutine = !!item.routineTaskId;

  if (isRoutine) return theme.accent.secondary;
  if (taskType === 'meeting') return theme.accent.success;
  if (taskType === 'milestone') return theme.accent.secondary;
  return theme.accent.primary;
};

export const AgendaItemCardMinimal: React.FC<AgendaItemCardMinimalProps> = ({
  item,
  onPress,
  onToggleComplete,
}) => {
  const isCompleted = isItemCompleted(item);
  const accentColor = useMemo(() => getAccentColor(item), [item]);

  const title = useMemo(
    () =>
      item.task?.title ||
      item.routineTask?.name ||
      item.routineTask?.routineName ||
      'Untitled',
    [item]
  );

  const timeLabel = useMemo(() => formatTime(getScheduledTime(item)), [item]);
  const durationLabel = useMemo(() => formatDuration(item.duration), [item.duration]);

  const metadata = useMemo(() => {
    const parts: string[] = [];
    if (timeLabel) parts.push(timeLabel);
    if (durationLabel) parts.push(durationLabel);
    return parts.join(' • ');
  }, [timeLabel, durationLabel]);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text
          style={[styles.title, isCompleted && styles.titleCompleted]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {metadata && <Text style={styles.metadata}>{metadata}</Text>}
      </View>
      {onToggleComplete && (
        <TouchableOpacity
          style={[styles.statusButton, isCompleted && styles.statusButtonCompleted]}
          onPress={e => {
            e.stopPropagation();
            onToggleComplete();
          }}
          activeOpacity={0.7}
        >
          <AppIcon
            name="check"
            size={12}
            color={isCompleted ? theme.background.primary : theme.accent.success}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 36,
    backgroundColor: theme.card.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderColor: theme.card.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  metadata: {
    fontSize: 10,
    color: theme.text.secondary,
    marginTop: 2,
  },
  statusButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.accent.success,
    backgroundColor: theme.card.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  statusButtonCompleted: {
    backgroundColor: theme.accent.success,
  },
});
