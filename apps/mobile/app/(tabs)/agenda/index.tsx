import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { Screen } from '@shared/components/Screen';
import { useFocusEffect, useRouter } from 'expo-router';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { agendaApi } from '@features/agenda/api/agendaApi';
import { AgendaItemEnrichedDto, AgendaViewMode, AgendaViewResponseDto, TaskDto } from 'shared-types';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import TaskSelectorModal from '@features/agenda/components/TaskSelectorModal';
import { TaskScheduleModal, TaskScheduleData } from '@features/agenda/components/TaskScheduleModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uiConstants from '@shared/theme/uiConstants';
import { formatDateKey } from '@shared/utils/date.utils';
import { AgendaHeaderCompact } from '@features/agenda/components/header/AgendaHeaderCompact';
import { CalendarPickerModal } from '@features/agenda/components/header/CalendarPickerModal';
import { LoadingSkeleton } from '@features/agenda/components/timeline/LoadingSkeleton';
import { UnfinishedTasksBadge } from '@features/agenda/components/unfinished/UnfinishedTasksBadge';
import { UnfinishedDrawer } from '@features/agenda/components/unfinished/UnfinishedDrawer';
import ErrorState from '@shared/components/ErrorState';
import { useTimelineScroll } from '@features/agenda/hooks/useTimelineScroll';
import { useUnfinishedTasks } from '@features/agenda/hooks/useUnfinishedTasks';
import { useSwipeGesture } from '@features/agenda/hooks/useSwipeGesture';
import { useHaptics } from '@features/agenda/hooks/useHaptics';
import { AgendaViewSwitcher } from '@features/agenda/components/header/AgendaViewSwitcher';
import { AgendaDayView } from '@features/agenda/components/views/AgendaDayView';
import { AgendaWeekView } from '@features/agenda/components/week/AgendaWeekView';
import { AgendaMonthView } from '@features/agenda/components/month/AgendaMonthView';

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [viewMode, setViewMode] = useState<AgendaViewMode>('day');
  const [anchorDate, setAnchorDate] = useState(formatDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewData, setViewData] = useState<AgendaViewResponseDto | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewError, setViewError] = useState<Error | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const { isDrawerOpen, openDrawer, closeDrawer } = useUnfinishedTasks();
  const dayHours = viewData?.mode === 'day' ? viewData.hours : [];
  const flatListRef = useTimelineScroll(dayHours, 60, !loading && viewData?.mode === 'day');

  const CACHE_FRESHNESS_MS = 30000;
  const fabBottom = uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + insets.bottom + 24;

  const loadAgendaView = useCallback(async (mode: AgendaViewMode, dateKey: string) => {
    try {
      setLoading(true);
      setViewError(null);
      const response = await agendaApi.getAgendaView({
        mode,
        anchorDate: dateKey,
        timezone,
      });
      setViewData(response);
    } catch (error) {
      const viewError = error instanceof Error ? error : new Error('Failed to load agenda view');
      console.error('Failed to load agenda view:', viewError);
      setViewError(viewError);
    } finally {
      setLoading(false);
    }
  }, [timezone]);

  const refreshAgendaData = useCallback(async () => {
    await loadAgendaView(viewMode, anchorDate);
    setLastRefreshTime(Date.now());
  }, [loadAgendaView, viewMode, anchorDate]);

  useEffect(() => {
    loadAgendaView(viewMode, anchorDate);
  }, [loadAgendaView, viewMode, anchorDate]);

  useEffect(() => {
    setSelectedDate(new Date(`${anchorDate}T00:00:00`));
  }, [anchorDate]);

  useAutoRefresh(['agenda_invalidated'], refreshAgendaData);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const cacheAge = now - lastRefreshTime;

      if (cacheAge > CACHE_FRESHNESS_MS) {
        refreshAgendaData();
      }
    }, [refreshAgendaData, lastRefreshTime, CACHE_FRESHNESS_MS])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAgendaData();
    setRefreshing(false);
  }, [refreshAgendaData]);

  const goToPrevious = () => {
    if (!viewData?.navigation?.previousAnchorDate) return;
    haptics.medium();
    setAnchorDate(viewData.navigation.previousAnchorDate);
  };

  const goToNext = () => {
    if (!viewData?.navigation?.nextAnchorDate) return;
    haptics.medium();
    setAnchorDate(viewData.navigation.nextAnchorDate);
  };

  const goToToday = () => {
    if (!viewData?.navigation?.todayAnchorDate) return;
    haptics.medium();
    setAnchorDate(viewData.navigation.todayAnchorDate);
  };

  const { panResponder, animatedStyle } = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 100,
    enabled: !showTaskSelector && !showScheduleModal && !showCalendarPicker && !isDrawerOpen,
  });

  const handleAgendaItemPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
      router.push(`/agenda/items/${agendaItem.agendaId}/${agendaItem.id}`);
    },
    [router]
  );

  const handleAgendaItemLongPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
      haptics.medium();
      Alert.alert(
        agendaItem.task?.title || 'Agenda Item',
        'Choose an action',
        [
          {
            text: 'View Details',
            onPress: () => handleAgendaItemPress(agendaItem),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              haptics.warning();
              Alert.alert(
                'Delete Agenda Item',
                'Are you sure you want to delete this scheduled item?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        haptics.error();
                        await agendaApi.deleteAgendaItem(
                          agendaItem.agendaId,
                          agendaItem.id
                        );
                        await refreshAgendaData();
                      } catch (error) {
                        haptics.error();
                        console.error('Failed to delete agenda item:', error);
                        Alert.alert('Error', 'Failed to delete agenda item');
                      }
                    },
                  },
                ]
              );
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    },
    [handleAgendaItemPress, refreshAgendaData, haptics]
  );

  const handleToggleComplete = useCallback(
    async (agendaItem: AgendaItemEnrichedDto) => {
      try {
        if (agendaItem.status === 'COMPLETED') {
          haptics.light();
          await agendaApi.markAsUnfinished(agendaItem.agendaId, agendaItem.id);
        } else {
          haptics.success();
          await agendaApi.completeAgendaItem(agendaItem.agendaId, agendaItem.id);
        }
        await refreshAgendaData();
      } catch (error) {
        haptics.error();
        console.error('Failed to update agenda item status:', error);
        Alert.alert('Error', 'Failed to update agenda item status');
      }
    },
    [refreshAgendaData, haptics]
  );

  const handleTaskSelected = useCallback((task: TaskDto) => {
    setSelectedTask(task);
    setShowTaskSelector(false);
    setShowScheduleModal(true);
  }, []);

  const handleScheduleTask = useCallback(
    async (data: TaskScheduleData) => {
      try {
        await agendaApi.createAgendaItem({
          agendaId: data.date,
          taskId: data.taskId,
          type: data.taskType,
          scheduledTime: data.time || null,
          durationMinutes: data.durationMinutes || null,
        });

        await refreshAgendaData();
        setSelectedTask(null);
      } catch (error) {
        console.error('Failed to schedule task:', error);
        throw error;
      }
    },
    [refreshAgendaData]
  );

  if (viewError && !loading) {
    return (
      <Screen hasTabBar>
        <ErrorState
          type="network"
          title="Failed to Load Agenda"
          message="Unable to load your agenda right now."
          error={viewError}
          onRetry={() => refreshAgendaData()}
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen hasTabBar>
        <AgendaHeaderCompact
          label={viewData?.label ?? 'Agenda'}
          onPreviousDay={goToPrevious}
          onNextDay={goToNext}
          onDatePress={() => {
            haptics.light();
            setShowCalendarPicker(true);
          }}
          onTodayPress={goToToday}
        />
        <AgendaViewSwitcher value={viewMode} onChange={setViewMode} />
        <LoadingSkeleton count={12} />
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <AgendaHeaderCompact
        label={viewData?.label ?? 'Agenda'}
        onPreviousDay={goToPrevious}
        onNextDay={goToNext}
        onDatePress={() => {
          haptics.light();
          setShowCalendarPicker(true);
        }}
        onTodayPress={goToToday}
      />
      <AgendaViewSwitcher value={viewMode} onChange={setViewMode} />

      <Animated.View style={[{ flex: 1 }, animatedStyle]} {...panResponder.panHandlers}>
        {viewData?.mode === 'day' && (
          <AgendaDayView
            view={viewData}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onScheduleTask={() => setShowTaskSelector(true)}
            onItemPress={handleAgendaItemPress}
            onItemLongPress={handleAgendaItemLongPress}
            onToggleComplete={handleToggleComplete}
            flatListRef={flatListRef}
          />
        )}
        {viewData?.mode === 'week' && (
          <AgendaWeekView
            view={viewData}
            onItemPress={handleAgendaItemPress}
            onItemLongPress={handleAgendaItemLongPress}
            onDayPress={(dateKey) => setAnchorDate(dateKey)}
          />
        )}
        {viewData?.mode === 'month' && (
          <AgendaMonthView
            view={viewData}
            onDayPress={(dateKey) => setAnchorDate(dateKey)}
            onItemPress={handleAgendaItemPress}
          />
        )}
      </Animated.View>

      <UnfinishedTasksBadge
        count={viewData?.unfinishedItems.length ?? 0}
        onPress={openDrawer}
        bottom={fabBottom}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => {
          haptics.light();
          setShowTaskSelector(true);
        }}
        accessibilityLabel="Schedule new task"
        accessibilityRole="button"
        accessibilityHint="Opens task selector modal"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CalendarPickerModal
        visible={showCalendarPicker}
        selectedDate={selectedDate}
        onClose={() => setShowCalendarPicker(false)}
        onDateSelect={date => {
          setSelectedDate(date);
          setAnchorDate(formatDateKey(date));
          setShowCalendarPicker(false);
        }}
      />

      <UnfinishedDrawer
        isOpen={isDrawerOpen}
        items={viewData?.unfinishedItems ?? []}
        onClose={closeDrawer}
        onItemPress={handleAgendaItemPress}
        onItemLongPress={handleAgendaItemLongPress}
        onToggleComplete={handleToggleComplete}
      />

      <TaskSelectorModal
        visible={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        onTaskSelected={handleTaskSelected}
      />

      <TaskScheduleModal
        visible={showScheduleModal}
        task={selectedTask}
        prefilledDate={anchorDate}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleScheduleTask}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: {
    color: theme.background.primary,
    fontSize: 28,
    fontWeight: '700',
  },
});
