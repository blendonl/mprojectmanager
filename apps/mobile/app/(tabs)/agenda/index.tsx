import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
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
import { AllDaySection } from '@features/agenda/components/sections/AllDaySection';
import { SpecialItemsHeader } from '@features/agenda/components/sections/SpecialItemsHeader';
import { UnfinishedTasksBadge } from '@features/agenda/components/unfinished/UnfinishedTasksBadge';
import { UnfinishedDrawer } from '@features/agenda/components/unfinished/UnfinishedDrawer';
import { useWakeSleepTimes } from '@features/agenda/hooks/useWakeSleepTimes';
import { useTimelineData } from '@features/agenda/hooks/useTimelineData';
import { useTimelineScroll } from '@features/agenda/hooks/useTimelineScroll';
import { useUnfinishedTasks } from '@features/agenda/hooks/useUnfinishedTasks';

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const { wakeSleepTimes, loading: wakeSleepLoading } = useWakeSleepTimes();
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
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleAgendaItemPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
      router.push(`/agenda/items/${agendaItem.agendaId}/${agendaItem.id}`);
    },
    [router]
  );

  const handleAgendaItemLongPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
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
                        const itemDate = getScheduledDate(agendaItem);
                        if (itemDate) {
                          await agendaApi.deleteAgendaItem(
                            agendaItem.agendaId,
                            agendaItem.id
                          );
                          await loadSingleDay(itemDate);
                        }
                      } catch (error) {
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
    [handleAgendaItemPress, loadSingleDay]
  );

  const handleToggleComplete = useCallback(
    async (agendaItem: AgendaItemEnrichedDto) => {
      try {
        if (agendaItem.status === 'COMPLETED') {
          await agendaApi.markAsUnfinished(agendaItem.agendaId, agendaItem.id);
        } else {
          await agendaApi.completeAgendaItem(agendaItem.agendaId, agendaItem.id);
        }
        const itemDate = getScheduledDate(agendaItem);
        if (itemDate) {
          await loadSingleDay(itemDate);
        }
      } catch (error) {
        console.error('Failed to update agenda item status:', error);
        Alert.alert('Error', 'Failed to update agenda item status');
      }
    },
    [loadSingleDay]
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

  if (loading) {
    return (
      <Screen hasTabBar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading agenda...</Text>
        </View>
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
        onDatePress={() => setShowCalendarPicker(true)}
        onTodayPress={goToToday}
      />

      <AgendaTimelineView>
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

        <Timeline24Hour
          hours={timelineData.hours}
          itemsByHour={timelineData.itemsByHour}
          onItemPress={handleAgendaItemPress}
          onToggleComplete={handleToggleComplete}
          flatListRef={flatListRef}
        />
      </AgendaTimelineView>

      <UnfinishedTasksBadge
        count={unfinishedItems.length}
        onPress={openDrawer}
        bottom={fabBottom}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => setShowTaskSelector(true)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.text.secondary,
    marginTop: spacing.md,
  },
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
