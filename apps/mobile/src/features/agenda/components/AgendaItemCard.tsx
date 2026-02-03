import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { AgendaItemEnrichedDto } from 'shared-types';
import { OrphanedItemBadge } from '@shared/components/OrphanedItemBadge';
import { theme } from '@shared/theme/colors';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';
import {
  getScheduledTime,
  isOrphanedItem,
  isItemCompleted,
} from '../utils/agendaHelpers';

interface AgendaItemCardProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
  onLongPress?: () => void;
  onToggleComplete?: () => void;
  sleepMode?: 'sleep' | 'wakeup';
  mode?: 'default' | 'minimal';
}

type TaskType = 'regular' | 'meeting' | 'milestone' | null;
type CardVariant = 'task' | 'sleep' | 'steps' | 'otherRoutine';

const getTaskTypeIcon = (taskType: TaskType, isRoutine: boolean): AppIconName => {
  if (isRoutine) {
    return 'shuffle';
  }

  switch (taskType) {
    case 'meeting':
      return 'users';
    case 'milestone':
      return 'milestone';
    default:
      return 'task';
  }
};

const getTaskTypeMeta = (taskType: TaskType, isRoutine: boolean) => {
  if (isRoutine) {
    return { label: 'Routine', color: theme.accent.secondary };
  }

  switch (taskType) {
    case 'meeting':
      return { label: 'Meeting', color: theme.accent.success };
    case 'milestone':
      return { label: 'Milestone', color: theme.accent.secondary };
    default:
      return { label: 'Task', color: theme.accent.primary };
  }
};

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

const resolveCardVariant = (hasTaskId: boolean, routineType: string | null): CardVariant => {
  if (hasTaskId) return 'task';
  if (routineType === 'SLEEP') return 'sleep';
  if (routineType === 'STEP') return 'steps';
  return 'otherRoutine';
};

const parseSleepRange = (target: string | null) => {
  if (!target) return null;
  const [start, end] = target.split('-').map((value) => value.trim());
  if (!start || !end) return null;
  return { start, end };
};

const parseNumericTarget = (target: string | null): number | null => {
  if (!target) return null;
  const cleaned = target.replace(/,/g, '').trim();
  const numeric = Number.parseInt(cleaned, 10);
  if (Number.isNaN(numeric)) return null;
  return numeric;
};

const formatStepValue = (value: number | null): string | null => {
  if (value === null || value === undefined) return null;
  return value.toLocaleString();
};

const AgendaItemCardComponent: React.FC<AgendaItemCardProps> = ({
  item,
  onPress,
  onLongPress,
  onToggleComplete,
  sleepMode,
  mode = 'default',
}) => {
  const isRoutineTask = !!item.routineTaskId;
  const hasTaskId = !!item.taskId;
  const cardVariant = resolveCardVariant(hasTaskId, item.routineTask?.routineType || null);
  const taskType = (item.task?.taskType || 'regular') as TaskType;
  const isOrphaned = isOrphanedItem(item);
  const projectName = item.task?.projectName || '';
  const boardName = item.task?.boardName || '';

  const taskTitle = useMemo(
    () => item.task?.title
      || item.routineTask?.name
      || item.routineTask?.routineName
      || item.taskId
      || 'Untitled',
    [item.task?.title, item.routineTask?.name, item.routineTask?.routineName, item.taskId]
  );

  const typeMeta = useMemo(
    () => getTaskTypeMeta(taskType, isRoutineTask),
    [isRoutineTask, taskType]
  );

  const timeLabel = useMemo(
    () => formatTime(getScheduledTime(item)),
    [item.startAt]
  );

  const isCompleted = isItemCompleted(item);
  const metadataLabel = useMemo(() => {
    if (isRoutineTask) {
      return item.routineTask?.routineName
        ? `Routine · ${item.routineTask.routineName}`
        : 'Routine';
    }

    return `${projectName} / ${boardName}`;
  }, [isRoutineTask, item.routineTask?.routineName, projectName, boardName]);

  const meetingLocation = null;
  const meetingAttendees: unknown[] = [];
  const hasDetailChips = false;

  const sleepRange = useMemo(
    () => parseSleepRange(item.routineTask?.routineTarget || null),
    [item.routineTask?.routineTarget]
  );

  const sleepTime = useMemo(() => {
    if (timeLabel) return timeLabel;
    if (sleepMode === 'wakeup') return sleepRange?.end || null;
    if (sleepMode === 'sleep') return sleepRange?.start || null;
    return sleepRange?.start || sleepRange?.end || null;
  }, [sleepMode, sleepRange, timeLabel]);

  const sleepAccent = useMemo(
    () => (sleepMode === 'wakeup' ? theme.accent.info : theme.accent.secondary),
    [sleepMode]
  );
  const sleepSurface = useMemo(
    () => (sleepMode === 'wakeup' ? theme.background.elevatedHigh : theme.background.secondary),
    [sleepMode]
  );

  const stepTarget = useMemo(
    () => parseNumericTarget(item.routineTask?.routineTarget || null),
    [item.routineTask?.routineTarget]
  );

  const stepProgress = 0;
  const actualSteps = 0;

  const formattedActualSteps = formatStepValue(actualSteps);
  const formattedTargetSteps = formatStepValue(stepTarget || 0);

  if (mode === 'minimal') {
    const accentColor = typeMeta.color;
    const metadata = useMemo(() => {
      const parts: string[] = [];
      if (timeLabel) parts.push(timeLabel);
      if (item.duration) parts.push(formatDuration(item.duration) || '');
      return parts.join(' • ');
    }, [timeLabel, item.duration]);

    return (
      <TouchableOpacity
        style={[styles.minimalCard, { borderLeftColor: accentColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.minimalContent}>
          <Text
            style={[styles.minimalTitle, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {taskTitle}
          </Text>
          {metadata && <Text style={styles.minimalMetadata}>{metadata}</Text>}
        </View>
        {onToggleComplete && (
          <TouchableOpacity
            style={[styles.minimalStatusButton, isCompleted && styles.completeToggleDone]}
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
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        cardVariant === 'task' && { borderLeftColor: typeMeta.color },
        cardVariant === 'sleep' && [styles.sleepCard, { backgroundColor: sleepSurface, borderColor: `${sleepAccent}55` }],
        cardVariant === 'steps' && styles.stepsCard,
        cardVariant === 'otherRoutine' && styles.otherRoutineCard,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {cardVariant === 'task' && (
        <>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.typeBadge, { backgroundColor: `${typeMeta.color}22` }]}>
                <AppIcon name={getTaskTypeIcon(taskType, isRoutineTask)} size={16} color={typeMeta.color} />
              </View>
              <View style={styles.titleBlock}>
                <Text
                  style={[
                    styles.title,
                    isOrphaned && styles.titleOrphaned,
                    isCompleted && styles.titleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {taskTitle}
                </Text>
                <Text style={styles.typeLabel}>{typeMeta.label}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              {!!onToggleComplete && (
                <TouchableOpacity
                  style={[styles.completeToggle, isCompleted && styles.completeToggleDone]}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    onToggleComplete();
                  }}
                  activeOpacity={0.7}
                >
                  <AppIcon
                    name="check"
                    size={14}
                    color={isCompleted ? theme.background.primary : theme.accent.success}
                  />
                </TouchableOpacity>
              )}
              {!isCompleted && timeLabel && (
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{timeLabel}</Text>
                </View>
              )}
            </View>
          </View>

          {isOrphaned && (
            <View style={styles.orphanedBadgeContainer}>
              <OrphanedItemBadge size="small" />
            </View>
          )}

          <View style={styles.metadata}>
            <Text style={styles.metadataText} numberOfLines={1}>
              {metadataLabel}
            </Text>
            {item.duration && (
              <View style={styles.durationBadge}>
                <AppIcon name="clock" size={12} color={theme.text.secondary} />
                <Text style={styles.durationText}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
            )}
          </View>

          {hasDetailChips && (
            <View style={styles.detailsRow}>
              {meetingLocation && (
                <View style={styles.detailChip}>
                  <AppIcon name="pin" size={12} color={theme.text.secondary} />
                  <Text style={styles.detailChipText} numberOfLines={1}>
                    {meetingLocation}
                  </Text>
                </View>
              )}
              {meetingAttendees.length > 0 && (
                <View style={styles.detailChip}>
                  <AppIcon name="users" size={12} color={theme.text.secondary} />
                  <Text style={styles.detailChipText}>
                    {meetingAttendees.length} {meetingAttendees.length === 1 ? 'person' : 'people'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {cardVariant === 'sleep' && (
        <View style={styles.sleepContent}>
          <View style={styles.sleepRow}>
            {!!onToggleComplete && (
              <TouchableOpacity
                style={[styles.completeToggle, isCompleted && styles.completeToggleDone]}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onToggleComplete();
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="check"
                  size={14}
                  color={isCompleted ? theme.background.primary : theme.accent.success}
                />
              </TouchableOpacity>
            )}
            <View style={styles.sleepTimeCard}>
              <Text style={[styles.sleepTime, { color: sleepAccent }]}>{sleepTime || '--:--'}</Text>
            </View>
          </View>
        </View>
      )}

      {cardVariant === 'steps' && (
        <View style={styles.stepsContent}>
          <View style={styles.stepsHeader}>
            <View style={styles.stepsBadge}>
              <AppIcon name="steps" size={16} color={theme.accent.primary} />
            </View>
            {!!onToggleComplete && (
              <TouchableOpacity
                style={[styles.completeToggle, isCompleted && styles.completeToggleDone]}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onToggleComplete();
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="check"
                  size={14}
                  color={isCompleted ? theme.background.primary : theme.accent.success}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.stepsProgressRow}>
            <View style={styles.stepsProgressBar}>
              <View style={[styles.stepsProgressFill, { width: `${Math.round(stepProgress * 100)}%` }]} />
            </View>
            <Text style={styles.stepsProgressText}>
              {stepTarget
                ? `${formattedActualSteps} / ${formattedTargetSteps}`
                : `${formattedActualSteps}`}
            </Text>
          </View>
        </View>
      )}

      {cardVariant === 'otherRoutine' && (
        <View style={styles.otherContent}>
          <View style={styles.otherHeader}>
            <View style={styles.otherTitleRow}>
              <View style={styles.otherBadge}>
                <AppIcon name="tag" size={16} color={theme.accent.secondary} />
              </View>
              <View style={styles.titleBlock}>
                <Text style={styles.otherTitle} numberOfLines={1}>
                  {item.routineTask?.routineName || 'Routine'}
                </Text>
                <Text style={styles.otherSubtitle}>Custom routine</Text>
              </View>
            </View>
            {!!onToggleComplete && (
              <TouchableOpacity
                style={[styles.completeToggle, isCompleted && styles.completeToggleDone]}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onToggleComplete();
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="check"
                  size={14}
                  color={isCompleted ? theme.background.primary : theme.accent.success}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.otherBody}>
            <Text style={styles.otherTarget} numberOfLines={2}>
              {item.routineTask?.routineTarget || 'Target not set'}
            </Text>
            {timeLabel && (
              <View style={styles.otherTimeBadge}>
                <Text style={styles.otherTimeText}>{timeLabel}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const arePropsEqual = (
  prevProps: AgendaItemCardProps,
  nextProps: AgendaItemCardProps
): boolean => {
  const prevItem = prevProps.item;
  const nextItem = nextProps.item;

  return (
    prevItem.id === nextItem.id &&
    prevItem.status === nextItem.status &&
    prevItem.startAt === nextItem.startAt &&
    prevItem.task?.taskType === nextItem.task?.taskType &&
    prevItem.routineTask?.routineType === nextItem.routineTask?.routineType &&
    prevItem.routineTask?.routineTarget === nextItem.routineTask?.routineTarget &&
    prevItem.task?.title === nextItem.task?.title &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress &&
    prevProps.onToggleComplete === nextProps.onToggleComplete &&
    prevProps.sleepMode === nextProps.sleepMode &&
    prevProps.mode === nextProps.mode
  );
};

export const AgendaItemCard = React.memo(AgendaItemCardComponent, arePropsEqual);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.card.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sleepCard: {
    borderLeftWidth: 0,
    borderColor: theme.border.primary,
    backgroundColor: theme.background.secondary,
    padding: 8,
  },
  stepsCard: {
    borderLeftWidth: 0,
    backgroundColor: theme.background.secondary,
  },
  otherRoutineCard: {
    borderLeftWidth: 0,
    backgroundColor: theme.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  completeToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.accent.success,
    backgroundColor: theme.card.background,
  },
  completeToggleDone: {
    backgroundColor: theme.accent.success,
    borderColor: theme.accent.success,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  titleOrphaned: {
    color: theme.text.tertiary,
    textDecorationLine: 'line-through',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  typeLabel: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.primary,
  },
  orphanedBadgeContainer: {
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metadataText: {
    flex: 1,
    fontSize: 12,
    color: theme.text.tertiary,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  detailChipText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  descriptionText: {
    marginTop: 6,
    fontSize: 12,
    color: theme.text.tertiary,
  },
  sleepContent: {
    gap: 8,
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sleepTimeCard: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  sleepSegment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  sleepTime: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  stepsContent: {
    gap: 10,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepsBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent.primary + '22',
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  stepsProgressRow: {
    gap: 6,
  },
  stepsProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    overflow: 'hidden',
  },
  stepsProgressFill: {
    height: '100%',
    backgroundColor: theme.accent.primary,
  },
  stepsProgressText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  otherContent: {
    gap: 10,
  },
  otherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otherTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  otherBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent.secondary + '22',
    borderWidth: 1,
    borderColor: theme.accent.secondary,
  },
  otherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  otherSubtitle: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  otherBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  otherTarget: {
    flex: 1,
    fontSize: 13,
    color: theme.text.secondary,
  },
  otherTimeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  otherTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.primary,
  },
  minimalCard: {
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
  minimalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  minimalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
  },
  minimalMetadata: {
    fontSize: 10,
    color: theme.text.secondary,
    marginTop: 2,
  },
  minimalStatusButton: {
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
});
