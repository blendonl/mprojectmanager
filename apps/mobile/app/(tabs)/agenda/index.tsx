import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Screen } from '@shared/components/Screen';
import { useFocusEffect, useRouter } from 'expo-router';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { agendaApi } from '@features/agenda/api/agendaApi';
import { AgendaFindAllItemDto, AgendaItemEnrichedDto, AgendaItemsDayDto, TaskDto } from 'shared-types';
import { getScheduledDate, getScheduledTime, isItemCompleted, isItemUnfinished } from '@features/agenda/utils/agendaHelpers';
import { AgendaItemCard } from '@features/agenda/components/AgendaItemCard';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import TaskSelectorModal from '@features/agenda/components/TaskSelectorModal';
import { TaskScheduleModal, TaskScheduleData } from '@features/agenda/components/TaskScheduleModal';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uiConstants from '@shared/theme/uiConstants';
import { formatDateKey } from '@shared/utils/date.utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type AgendaSection = { title: string; icon: AppIconName; data: AgendaItemEnrichedDto[] };

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(getMonthStart(new Date()));
  const [weekSummary, setWeekSummary] = useState<Map<string, AgendaFindAllItemDto>>(new Map());
  const [monthSummary, setMonthSummary] = useState<Map<string, AgendaFindAllItemDto>>(new Map());
  const [selectedDayData, setSelectedDayData] = useState<AgendaItemsDayDto | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [unfinishedItems, setUnfinishedItems] = useState<AgendaItemEnrichedDto[]>([]);
  const [searchResults, setSearchResults] = useState<AgendaItemsDayDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'unfinished'>('all');
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery.trim());

  const CACHE_FRESHNESS_MS = 30000;
  const fabBottom = uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + insets.bottom + 24;

  const loadWeekData = useCallback(async () => {
    try {
      const weekStartStr = formatDateKey(weekStart);
      const weekEnd = getWeekEnd(weekStart);
      const weekEndStr = formatDateKey(weekEnd);

      const [summary] = await Promise.all([
        agendaApi.getAgendaSummaries(weekStartStr, weekEndStr),
      ]);

      setWeekSummary(new Map((summary?.items ?? []).map(item => [item.date, item])));
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  const loadMonthData = useCallback(async () => {
    try {
      setMonthLoading(true);
      const monthStart = getMonthStart(monthAnchor);
      const monthEnd = getMonthEnd(monthAnchor);
      const monthStartStr = formatDateKey(monthStart);
      const monthEndStr = formatDateKey(monthEnd);

      const [summary] = await Promise.all([
        agendaApi.getAgendaSummaries(monthStartStr, monthEndStr),
      ]);

      setMonthSummary(new Map((summary?.items ?? []).map(item => [item.date, item])));
    } catch (error) {
      console.error('Failed to load month data:', error);
    } finally {
      setMonthLoading(false);
    }
  }, [monthAnchor]);

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

  const loadSingleDay = useCallback(async (date: string) => {
    try {
      const [summary, response] = await Promise.all([
        agendaApi.getAgendaSummaries(date, date, 1, 1),
        agendaApi.getAgendaItems({ date, mode: 'all' }),
      ]);

      setSelectedDayData(response?.items?.[0] ?? null);

      setWeekSummary(prev => {
        const newMap = new Map(prev);
        if (summary?.items?.[0]) {
          newMap.set(date, summary.items[0]);
        } else {
          newMap.delete(date);
        }
        return newMap;
      });

      if (viewMode === 'month') {
        setMonthSummary(prev => {
          const newMap = new Map(prev);
          if (summary?.items?.[0]) {
            newMap.set(date, summary.items[0]);
          } else {
            newMap.delete(date);
          }
          return newMap;
        });
      }
    } catch (error) {
      console.error(`Failed to reload day ${date}:`, error);
    }
  }, [viewMode]);

  const refreshAgendaData = useCallback(async () => {
    await Promise.all([
      loadWeekData(),
      loadUnfinished(),
      viewMode === 'month' ? loadMonthData() : Promise.resolve(),
    ]);
    setLastRefreshTime(Date.now());
  }, [loadWeekData, loadMonthData, loadUnfinished, viewMode]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  useEffect(() => {
    if (viewMode === 'month') {
      loadMonthData();
    }
  }, [viewMode, loadMonthData]);

  useEffect(() => {
    loadUnfinished();
  }, [loadUnfinished]);

  useEffect(() => {
    const date = formatDateKey(selectedDate);
    loadSingleDay(date);
  }, [selectedDate, loadSingleDay]);

  useEffect(() => {
    if (debouncedSearchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    const date = formatDateKey(selectedDate);

    setSearchLoading(true);
    agendaApi.searchAgendaItems(debouncedSearchQuery, searchMode, date)
      .then(response => setSearchResults(response?.items ?? []))
      .catch((error) => {
        console.error('Failed to search agenda items:', error);
      })
      .finally(() => setSearchLoading(false));
  }, [debouncedSearchQuery, searchMode, selectedDate]);

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

  const goToPreviousWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
    setSelectedDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
    setSelectedDate(next);
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(getMonday(today));
    setMonthAnchor(getMonthStart(today));
    setSelectedDate(today);
  };

  const weekDays = useMemo((): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

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

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getSelectedDayData = (): AgendaItemsDayDto | null => selectedDayData;

  const getDayAgendaCount = (dateKey: string): number => {
    const summary = viewMode === 'month' ? monthSummary.get(dateKey) : weekSummary.get(dateKey);
    return summary?.agendaItemsTotal ?? 0;
  };

  const handleAgendaItemPress = useCallback((agendaItem: AgendaItemEnrichedDto) => {
    router.push(`/agenda/items/${agendaItem.agendaId}/${agendaItem.id}`);
  }, [router]);

  const handleAgendaItemLongPress = useCallback((agendaItem: AgendaItemEnrichedDto) => {
    Alert.alert(
      agendaItem.task?.title || 'Agenda Item',
      'Choose an action',
      [
        {
          text: 'View Details',
          onPress: () => handleAgendaItemPress(agendaItem),
        },
        {
          text: 'Reschedule',
          onPress: () => {
            handleAgendaItemPress(agendaItem);
          },
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
                        await agendaApi.deleteAgendaItem(agendaItem.agendaId, agendaItem.id);
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
  }, [handleAgendaItemPress, loadSingleDay]);

  const handleToggleComplete = useCallback(async (agendaItem: AgendaItemEnrichedDto) => {
    try {
      if (isItemCompleted(agendaItem)) {
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
  }, [loadSingleDay]);

  const goToPreviousMonth = () => {
    const prev = new Date(monthAnchor);
    prev.setMonth(prev.getMonth() - 1);
    setMonthAnchor(getMonthStart(prev));
    setSelectedDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
  };

  const goToNextMonth = () => {
    const next = new Date(monthAnchor);
    next.setMonth(next.getMonth() + 1);
    setMonthAnchor(getMonthStart(next));
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const toggleViewMode = () => {
    if (viewMode === 'week') {
      setViewMode('month');
      setMonthAnchor(getMonthStart(selectedDate));
    } else {
      setViewMode('week');
      setWeekStart(getMonday(selectedDate));
    }
  };

  const renderWeekHeader = () => {
    const headerDate = viewMode === 'month' ? monthAnchor : selectedDate;
    const monthLabel = headerDate.toLocaleDateString('en-US', { month: 'short' });
    const yearLabel = headerDate.toLocaleDateString('en-US', { year: 'numeric' });
    const goPrev = viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek;
    const goNext = viewMode === 'month' ? goToNextMonth : goToNextWeek;

    return (
      <View style={styles.calendarCard}>
        <View style={styles.calendarTopRow}>
          <TouchableOpacity onPress={goPrev} style={styles.navButton}>
            <AppIcon name="arrow-left" size={16} color={theme.text.secondary} />
          </TouchableOpacity>
          <View style={styles.calendarTitleRow}>
            <TouchableOpacity onPress={goToToday} style={styles.monthButton}>
              <Text style={styles.monthText}>{monthLabel}</Text>
              <Text style={styles.yearText}>{yearLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, styles.viewToggleButtonActive]}
              onPress={toggleViewMode}
            >
              <Text style={[styles.viewToggleText, styles.viewToggleTextActive]}>
                {viewMode === 'week' ? 'W' : 'M'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={goNext} style={styles.navButton}>
            <AppIcon name="arrow-right" size={16} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>
        {viewMode === 'week' ? (
          <View style={styles.daysRow}>
            {weekDays.map((date, index) => {
              const dateStr = formatDateKey(date);
              const itemCount = getDayAgendaCount(dateStr);
              const hasItems = itemCount > 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected(date) && styles.dayCellSelected,
                    isToday(date) && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dayName,
                    isSelected(date) && styles.dayNameSelected,
                  ]}>
                    {DAYS[index]}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    isSelected(date) && styles.dayNumberSelected,
                    isToday(date) && !isSelected(date) && styles.dayNumberToday,
                  ]}>
                    {date.getDate()}
                  </Text>
                  {hasItems && (
                    <View style={[styles.dayCount, isSelected(date) && styles.dayCountSelected]}>
                      <Text style={[styles.dayCountText, isSelected(date) && styles.dayCountTextSelected]}>
                        {itemCount > 9 ? '9+' : itemCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.monthGridContainer}>
            <View style={styles.monthWeekdayRow}>
              {DAYS.map(day => (
                <Text key={day} style={styles.monthWeekdayText}>{day}</Text>
              ))}
            </View>
            {monthLoading ? (
              <View style={styles.monthLoading}>
                <ActivityIndicator size="small" color={theme.accent.primary} />
                <Text style={styles.monthLoadingText}>Loading month...</Text>
              </View>
            ) : (
              <View style={styles.monthGrid}>
                {monthGridDays.map((date, index) => {
                  const dateKey = formatDateKey(date);
                  const itemCount = getDayAgendaCount(dateKey);
                  const isOutside = date.getMonth() !== monthAnchor.getMonth();

                  return (
                    <TouchableOpacity
                      key={`${dateKey}-${index}`}
                      style={[
                        styles.monthDayCell,
                        isOutside && styles.monthDayCellOutside,
                        isSelected(date) && styles.monthDayCellSelected,
                        isToday(date) && styles.monthDayCellToday,
                      ]}
                      onPress={() => {
                        setSelectedDate(date);
                        if (isOutside) {
                          setMonthAnchor(getMonthStart(date));
                        }
                      }}
                    >
                      <Text style={[
                        styles.monthDayNumber,
                        isOutside && styles.monthDayNumberOutside,
                        isSelected(date) && styles.monthDayNumberSelected,
                      ]}>
                        {date.getDate()}
                      </Text>
                      {itemCount > 0 && (
                        <View style={[
                          styles.monthDayBadge,
                          isSelected(date) && styles.monthDayBadgeSelected,
                        ]}>
                          <Text style={[
                            styles.monthDayBadgeText,
                            isSelected(date) && styles.monthDayBadgeTextSelected,
                          ]}>
                            {itemCount > 9 ? '9+' : itemCount}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderAgendaItem = useCallback(({ item }: { item: AgendaItemEnrichedDto }) => (
    <AgendaItemCard
      item={item}
      onPress={() => handleAgendaItemPress(item)}
      onLongPress={() => handleAgendaItemLongPress(item)}
      onToggleComplete={() => handleToggleComplete(item)}
    />
  ), [handleAgendaItemPress, handleAgendaItemLongPress, handleToggleComplete]);

  const searchSections = useMemo(() => {
    if (debouncedSearchQuery.length === 0) {
      return [];
    }

    return searchResults.map((day) => {
      const items = [
        ...day.tasks,
        ...day.routines,
        ...day.steps,
        ...(day.sleep.sleep ? [day.sleep.sleep] : []),
        ...(day.sleep.wakeup ? [day.sleep.wakeup] : []),
      ];

      return {
        title: formatSearchDateLabel(day.date),
        data: items.sort((left, right) => {
          const leftTime = getScheduledTime(left) || '';
          const rightTime = getScheduledTime(right) || '';
          return leftTime.localeCompare(rightTime);
        }),
      };
    });
  }, [debouncedSearchQuery, searchResults]);

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <View style={styles.searchLoading}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
          <Text style={styles.searchLoadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchSections.length === 0) {
      return (
        <View style={styles.searchEmpty}>
          <AppIcon name="search" size={26} color={theme.text.muted} />
          <Text style={styles.searchEmptyTitle}>No matching tasks</Text>
          <Text style={styles.searchEmptySubtitle}>Try a project, goal, or task name.</Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={searchSections}
        keyExtractor={(item) => item.id}
        renderItem={renderAgendaItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.searchSectionHeader}>
            <Text style={styles.searchSectionText}>{section.title}</Text>
            <View style={styles.searchSectionPill}>
              <Text style={styles.searchSectionCount}>{section.data.length}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.dayListContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
      />
    );
  };

  const renderSectionHeader = useCallback(({ section }: { section: AgendaSection }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionIcon}>
          <AppIcon name={section.icon} size={14} color={theme.text.secondary} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCountPill}>
          <Text style={styles.sectionCountText}>{section.data.length}</Text>
        </View>
      </View>
    </View>
  ), []);

  const handleTaskSelected = useCallback((task: TaskDto) => {
    setSelectedTask(task);
    setShowTaskSelector(false);
    setShowScheduleModal(true);
  }, []);

  const handleScheduleTask = useCallback(async (data: TaskScheduleData) => {
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
  }, [loadSingleDay]);

  const renderDayContent = () => {
    if (debouncedSearchQuery.length > 0) {
      return renderSearchResults();
    }

    const selectedDateStr = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const selectedDay = getSelectedDayData();
    const agendaItems = selectedDay
      ? [...selectedDay.tasks, ...selectedDay.routines]
      : [];
    const sleepItem = selectedDay?.sleep.sleep ?? null;
    const wakeupItem = selectedDay?.sleep.wakeup ?? null;
    const stepItem = selectedDay?.steps[0] ?? null;
    const totalItemCount = getDayAgendaCount(formatDateKey(selectedDate));

    const timeBlocks = agendaItems.filter(
      item => getScheduledTime(item) && !isItemUnfinished(item)
    );
    const allDayTasks = agendaItems.filter(
      item => !getScheduledTime(item)
    );

    if (totalItemCount === 0 && unfinishedItems.length === 0) {
      return (
        <View style={styles.emptyDay}>
          <AppIcon name="calendar" size={28} color={theme.text.muted} />
          <Text style={styles.emptyTitle}>No tasks scheduled</Text>
          <Text style={styles.emptySubtitle}>{selectedDateStr}</Text>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => setShowTaskSelector(true)}
          >
            <Text style={styles.scheduleButtonText}>+ Schedule a task</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const sections: AgendaSection[] = [
      { title: 'Unfinished', icon: 'alert' as AppIconName, data: unfinishedItems },
      { title: 'Time Blocks', icon: 'clock' as AppIconName, data: timeBlocks },
      { title: 'All Day', icon: 'calendar' as AppIconName, data: allDayTasks },
    ].filter(section => section.data.length > 0);

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderAgendaItem}
        renderSectionHeader={renderSectionHeader}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={(
          <View style={styles.dayHeader}>
            <View style={styles.dayHeaderRow}>
            </View>
            {wakeupItem && (
              <View style={styles.specialSection}>
                <Text style={styles.specialTitle}>Wake up</Text>
                <AgendaItemCard
                  item={wakeupItem}
                  sleepMode="wakeup"
                  onPress={() => handleAgendaItemPress(wakeupItem)}
                  onLongPress={() => handleAgendaItemLongPress(wakeupItem)}
                  onToggleComplete={() => handleToggleComplete(wakeupItem)}
                />
              </View>
            )}
            {stepItem && (
              <View style={styles.specialSection}>
                <Text style={styles.specialTitle}>Steps</Text>
                <AgendaItemCard
                  item={stepItem}
                  onPress={() => handleAgendaItemPress(stepItem)}
                  onLongPress={() => handleAgendaItemLongPress(stepItem)}
                  onToggleComplete={() => handleToggleComplete(stepItem)}
                />
              </View>
            )}
            {(wakeupItem || stepItem) && <View style={styles.specialDivider} />}
          </View>
        )}
        ListFooterComponent={sleepItem ? (
          <View style={styles.specialFooter}>
            <View style={styles.specialDivider} />
            <Text style={styles.specialTitle}>Sleep</Text>
            <AgendaItemCard
              item={sleepItem}
              sleepMode="sleep"
              onPress={() => handleAgendaItemPress(sleepItem)}
              onLongPress={() => handleAgendaItemLongPress(sleepItem)}
              onToggleComplete={() => handleToggleComplete(sleepItem)}
            />
          </View>
        ) : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        contentContainerStyle={styles.dayListContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    );
  };

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

  return (
    <Screen hasTabBar>
      {renderWeekHeader()}

      <View style={styles.searchCard}>
        <View style={styles.searchInputRow}>
          <AppIcon name="search" size={16} color={theme.text.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks, projects, goals"
            placeholderTextColor={theme.text.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchToggleRow}>
            <TouchableOpacity
              style={[
                styles.searchToggleButton,
                searchMode === 'all' && styles.searchToggleButtonActive,
              ]}
              onPress={() => setSearchMode('all')}
            >
              <Text
                style={[
                  styles.searchToggleText,
                  searchMode === 'all' && styles.searchToggleTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.searchToggleButton,
                searchMode === 'unfinished' && styles.searchToggleButtonActive,
              ]}
              onPress={() => setSearchMode('unfinished')}
            >
              <Text
                style={[
                  styles.searchToggleText,
                  searchMode === 'unfinished' && styles.searchToggleTextActive,
                ]}
              >
                Unfinished
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderDayContent()}

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => setShowTaskSelector(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatSearchDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.text.secondary,
    marginTop: spacing.md,
  },
  calendarCard: {
    backgroundColor: theme.background.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border.primary,
    paddingVertical: spacing.sm,
  },
  calendarTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  monthButton: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
  },
  yearText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '500',
  },
  viewToggleButton: {
    marginTop: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border.primary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    borderColor: theme.accent.primary,
  },
  viewToggleText: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  viewToggleTextActive: {
    color: theme.accent.primary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    minWidth: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellSelected: {
    backgroundColor: theme.accent.primary + '1A',
    borderColor: theme.accent.primary,
  },
  dayCellToday: {
    borderColor: theme.accent.primary,
  },
  dayName: {
    fontSize: 11,
    color: theme.text.secondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNameSelected: {
    color: theme.accent.primary,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
  },
  dayNumberSelected: {
    color: theme.accent.primary,
  },
  dayNumberToday: {
    color: theme.accent.primary,
  },
  dayCount: {
    marginTop: 4,
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  dayCountSelected: {
    backgroundColor: theme.accent.primary,
  },
  dayCountText: {
    fontSize: 10,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  dayCountTextSelected: {
    color: theme.background.primary,
  },
  monthGridContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  monthWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  monthWeekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    color: theme.text.secondary,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  monthDayCellOutside: {
    opacity: 0.3,
  },
  monthDayCellSelected: {
    backgroundColor: theme.accent.primary + '1A',
    borderRadius: 12,
  },
  monthDayCellToday: {
    borderWidth: 1,
    borderColor: theme.accent.primary,
    borderRadius: 12,
  },
  monthDayNumber: {
    fontSize: 12,
    color: theme.text.primary,
    fontWeight: '600',
  },
  monthDayNumberOutside: {
    color: theme.text.muted,
  },
  monthDayNumberSelected: {
    color: theme.accent.primary,
  },
  monthDayBadge: {
    marginTop: 4,
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  monthDayBadgeSelected: {
    backgroundColor: theme.accent.primary,
  },
  monthDayBadgeText: {
    fontSize: 10,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  monthDayBadgeTextSelected: {
    color: theme.background.primary,
  },
  monthLoading: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  monthLoadingText: {
    marginTop: spacing.xs,
    color: theme.text.secondary,
    fontSize: 12,
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border.primary,
    padding: spacing.md,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.text.primary,
  },
  searchToggleRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  searchToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border.primary,
    backgroundColor: theme.background.elevated,
  },
  searchToggleButtonActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + '1A',
  },
  searchToggleText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  searchToggleTextActive: {
    color: theme.accent.primary,
  },
  searchLoading: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  searchLoadingText: {
    marginTop: spacing.sm,
    color: theme.text.secondary,
  },
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  searchEmptyTitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  searchEmptySubtitle: {
    marginTop: spacing.xs,
    color: theme.text.secondary,
  },
  dayListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCountPill: {
    marginLeft: 'auto',
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 11,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  searchSectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  searchSectionPill: {
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  searchSectionCount: {
    fontSize: 11,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    color: theme.text.secondary,
  },
  scheduleButton: {
    marginTop: spacing.md,
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: theme.background.primary,
    fontWeight: '700',
  },
  specialSection: {
    marginTop: spacing.md,
  },
  specialFooter: {
    marginTop: spacing.md,
  },
  specialTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  specialDivider: {
    height: 1,
    backgroundColor: theme.border.primary,
    marginTop: spacing.md,
  },
  dayHeader: {
    paddingTop: spacing.sm,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
