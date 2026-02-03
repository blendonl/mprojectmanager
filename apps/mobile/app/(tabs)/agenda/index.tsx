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
import { AgendaItemEnrichedDto, AgendaItemsDayDto, TaskDto } from 'shared-types';
import { getScheduledDate, isItemUnfinished } from '@features/agenda/utils/agendaHelpers';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import TaskSelectorModal from '@features/agenda/components/TaskSelectorModal';
import { TaskScheduleModal, TaskScheduleData } from '@features/agenda/components/TaskScheduleModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uiConstants from '@shared/theme/uiConstants';
import { formatDateKey } from '@shared/utils/date.utils';
import { AgendaHeaderCompact } from '@features/agenda/components/header/AgendaHeaderCompact';
import { CalendarPickerModal } from '@features/agenda/components/header/CalendarPickerModal';
import { AgendaTimelineView } from '@features/agenda/components/timeline/AgendaTimelineView';
import { Timeline24Hour } from '@features/agenda/components/timeline/Timeline24Hour';
import { LoadingSkeleton } from '@features/agenda/components/timeline/LoadingSkeleton';
import { AllDaySection } from '@features/agenda/components/sections/AllDaySection';
import { SpecialItemsHeader } from '@features/agenda/components/sections/SpecialItemsHeader';
import { UnfinishedTasksBadge } from '@features/agenda/components/unfinished/UnfinishedTasksBadge';
import { UnfinishedDrawer } from '@features/agenda/components/unfinished/UnfinishedDrawer';
import { useWakeSleepTimes } from '@features/agenda/hooks/useWakeSleepTimes';
import ErrorState from '@shared/components/ErrorState';
import { useTimelineData } from '@features/agenda/hooks/useTimelineData';
import { useTimelineScroll } from '@features/agenda/hooks/useTimelineScroll';
import { useUnfinishedTasks } from '@features/agenda/hooks/useUnfinishedTasks';
import { useSwipeGesture } from '@features/agenda/hooks/useSwipeGesture';
import { useHaptics } from '@features/agenda/hooks/useHaptics';

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayData, setSelectedDayData] = useState<AgendaItemsDayDto | null>(null);
  const [unfinishedItems, setUnfinishedItems] = useState<AgendaItemEnrichedDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const { wakeSleepTimes, loading: wakeSleepLoading, error: wakeSleepError, retry: retryWakeSleep } = useWakeSleepTimes();
  const timelineData = useTimelineData(selectedDayData, wakeSleepTimes);
  const flatListRef = useTimelineScroll(timelineData.hours, 60, !loading);
  const { isDrawerOpen, openDrawer, closeDrawer } = useUnfinishedTasks();

  const CACHE_FRESHNESS_MS = 30000;
  const fabBottom = uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + insets.bottom + 24;

  const loadSingleDay = useCallback(async (date: string) => {
    try {
      const response = await agendaApi.getAgendaItems({ date, mode: 'all' });
      setSelectedDayData(response?.items?.[0] ?? null);
    } catch (error) {
      console.error(`Failed to load day ${date}:`, error);
    }
  }, []);

  const loadUnfinished = useCallback(async () => {
    try {
      const date = formatDateKey(selectedDate);
      const response = await agendaApi.getAgendaItems({
        date,
        mode: 'unfinished',
      });
      setUnfinishedItems(response?.items?.[0]?.unfinished ?? []);
    } catch (error) {
      console.error('Failed to load unfinished items:', error);
    }
  }, [selectedDate]);

  const refreshAgendaData = useCallback(async () => {
    await Promise.all([
      loadSingleDay(formatDateKey(selectedDate)),
      loadUnfinished(),
    ]);
    setLastRefreshTime(Date.now());
  }, [loadSingleDay, loadUnfinished, selectedDate]);

  useEffect(() => {
    const date = formatDateKey(selectedDate);
    loadSingleDay(date);
  }, [selectedDate, loadSingleDay]);

  useEffect(() => {
    loadUnfinished();
  }, [loadUnfinished]);

  useEffect(() => {
    if (!wakeSleepLoading) {
      setLoading(false);
    }
  }, [wakeSleepLoading]);

  const hasAnyContent = useMemo(() => {
    if (!selectedDayData) return false;
    return (
      (selectedDayData.tasks?.length ?? 0) > 0 ||
      (selectedDayData.routines?.length ?? 0) > 0 ||
      !!selectedDayData.sleep?.wakeup ||
      (selectedDayData.steps?.length ?? 0) > 0 ||
      unfinishedItems.length > 0
    );
  }, [selectedDayData, unfinishedItems]);

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

  const goToPreviousDay = () => {
    haptics.medium();
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    haptics.medium();
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    haptics.medium();
    setSelectedDate(new Date());
  };

  const { panResponder, animatedStyle } = useSwipeGesture({
    onSwipeLeft: goToNextDay,
    onSwipeRight: goToPreviousDay,
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
                        const itemDate = getScheduledDate(agendaItem);
                        if (itemDate) {
                          await agendaApi.deleteAgendaItem(
                            agendaItem.agendaId,
                            agendaItem.id
                          );
                          await loadSingleDay(itemDate);
                        }
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
    [handleAgendaItemPress, loadSingleDay, haptics]
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
        const itemDate = getScheduledDate(agendaItem);
        if (itemDate) {
          await loadSingleDay(itemDate);
        }
      } catch (error) {
        haptics.error();
        console.error('Failed to update agenda item status:', error);
        Alert.alert('Error', 'Failed to update agenda item status');
      }
    },
    [loadSingleDay, haptics]
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

        await loadSingleDay(data.date);
        setSelectedTask(null);
      } catch (error) {
        console.error('Failed to schedule task:', error);
        throw error;
      }
    },
    [loadSingleDay]
  );

  const { wakeUpHour, sleepHour } = useMemo(() => {
    const wake = wakeSleepTimes.wake
      ? parseInt(wakeSleepTimes.wake.split(':')[0], 10)
      : undefined;
    const sleep = wakeSleepTimes.sleep
      ? parseInt(wakeSleepTimes.sleep.split(':')[0], 10)
      : undefined;
    return { wakeUpHour: wake, sleepHour: sleep };
  }, [wakeSleepTimes.wake, wakeSleepTimes.sleep]);

  if (wakeSleepError && !loading) {
    return (
      <Screen hasTabBar>
        <ErrorState
          type="network"
          title="Failed to Load Settings"
          message="Unable to load wake/sleep times. Using default values (7 AM - 11 PM)."
          error={wakeSleepError}
          onRetry={retryWakeSleep}
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen hasTabBar>
        <AgendaHeaderCompact
          date={selectedDate}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
          onDatePress={() => {
            haptics.light();
            setShowCalendarPicker(true);
          }}
          onTodayPress={goToToday}
        />
        <LoadingSkeleton count={12} />
      </Screen>
    );
  }

  const wakeupItem = selectedDayData?.sleep.wakeup ?? null;
  const stepItem = selectedDayData?.steps[0] ?? null;

  return (
    <Screen hasTabBar>
      <AgendaHeaderCompact
        date={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onDatePress={() => {
          haptics.light();
          setShowCalendarPicker(true);
        }}
        onTodayPress={goToToday}
      />

      <Animated.View style={[{ flex: 1 }, animatedStyle]} {...panResponder.panHandlers}>
        <AgendaTimelineView
          isEmpty={!loading && !hasAnyContent}
          selectedDate={selectedDate}
          onScheduleTask={() => setShowTaskSelector(true)}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
        <Timeline24Hour
          hours={timelineData.hours}
          itemsByHour={timelineData.itemsByHour}
          onItemPress={handleAgendaItemPress}
          onToggleComplete={handleToggleComplete}
          flatListRef={flatListRef}
          selectedDate={selectedDate}
          wakeUpHour={wakeUpHour}
          sleepHour={sleepHour}
          refreshing={refreshing}
          onRefresh={onRefresh}
          headerComponent={
            <>
              <SpecialItemsHeader
                wakeupItem={wakeupItem}
                stepItem={stepItem}
                onItemPress={handleAgendaItemPress}
                onItemLongPress={handleAgendaItemLongPress}
                onToggleComplete={handleToggleComplete}
              />
              <AllDaySection
                items={timelineData.allDayItems}
                onItemPress={handleAgendaItemPress}
                onToggleComplete={handleToggleComplete}
              />
            </>
          }
        />
      </AgendaTimelineView>
      </Animated.View>

      <UnfinishedTasksBadge
        count={unfinishedItems.length}
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
          setShowCalendarPicker(false);
        }}
      />

      <UnfinishedDrawer
        isOpen={isDrawerOpen}
        items={unfinishedItems}
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
        prefilledDate={formatDateKey(selectedDate)}
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
