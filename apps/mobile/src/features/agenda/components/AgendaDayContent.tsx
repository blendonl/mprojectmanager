import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AppIcon, { AppIconName } from "@shared/components/icons/AppIcon";
import theme from "@shared/theme/colors";
import { spacing } from "@shared/theme/spacing";
import { AgendaEnrichedDto, AgendaItemEnrichedDto } from 'shared-types';
import { AgendaSection } from "../types/agenda-screen.types";
import { AgendaItemCard } from "./AgendaItemCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { formatDateKey, formatSearchDateLabel } from "@shared/utils/date.utils";
import { getScheduledDate, getScheduledTime, getOrphanedItems, isItemCompleted } from '../utils/agendaHelpers';

interface AgendaDayContentProps {
  selectedDate: Date;
  agendaData: AgendaEnrichedDto[];
  unfinishedItems: AgendaItemEnrichedDto[];
  searchResults: AgendaItemEnrichedDto[];
  isSearching: boolean;
  searchLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  onScheduleTask: () => void;
}

export function AgendaDayContent({
  selectedDate,
  agendaData,
  unfinishedItems,
  searchResults,
  isSearching,
  searchLoading,
  refreshing,
  onRefresh,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
  onScheduleTask,
}: AgendaDayContentProps) {
  const renderAgendaItem = useCallback(
    ({ item }: { item: AgendaItemEnrichedDto }) => (
      <AgendaItemCard
        item={item}
        onPress={() => onItemPress(item)}
        onLongPress={() => onItemLongPress(item)}
        onToggleComplete={() => onToggleComplete(item)}
      />
    ),
    [onItemPress, onItemLongPress, onToggleComplete],
  );

  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }, [selectedDate]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: AgendaSection }) => (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIcon}>
            <AppIcon
              name={section.icon}
              size={14}
              color={theme.text.secondary}
            />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCountPill}>
            <Text style={styles.sectionCountText}>{section.data.length}</Text>
          </View>
        </View>
        {section.title === "Time Blocks" && isToday && (
          <CurrentTimeIndicator />
        )}
      </View>
    ),
    [isToday],
  );

  const searchSections = useMemo(() => {
    const grouped = new Map<string, AgendaItemEnrichedDto[]>();
    searchResults.forEach((item) => {
      const dateKey = getScheduledDate(item) || '';
      if (dateKey) {
        const existing = grouped.get(dateKey) || [];
        existing.push(item);
        grouped.set(dateKey, existing);
      }
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        title: formatSearchDateLabel(dateKey),
        data: items.sort((left, right) => {
          const leftTime = getScheduledTime(left) || "";
          const rightTime = getScheduledTime(right) || "";
          return leftTime.localeCompare(rightTime);
        }),
      }));
  }, [searchResults]);

  if (isSearching) {
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
          <Text style={styles.searchEmptySubtitle}>
            Try a project, goal, or task name.
          </Text>
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
              <Text style={styles.searchSectionCount}>
                {section.data.length}
              </Text>
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
  }

  const dayAgenda = agendaData.find(
    (d) => d.date === formatDateKey(selectedDate),
  );
  const selectedDateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const agendaItems = dayAgenda
    ? [...dayAgenda.tasks, ...dayAgenda.routines]
    : [];
  const wakeupItem = dayAgenda?.sleep.wakeup ?? null;
  const sleepItem = dayAgenda?.sleep.sleep ?? null;
  const stepItem = dayAgenda?.steps[0] ?? null;
  const totalItemCount =
    agendaItems.length
    + (dayAgenda?.steps.length || 0)
    + (wakeupItem ? 1 : 0)
    + (sleepItem ? 1 : 0);

  const timeBlocks = agendaItems.filter(
    (item) => getScheduledTime(item) !== null && !isItemCompleted(item),
  );
  const allDayTasks = agendaItems.filter(
    (item) => getScheduledTime(item) === null,
  );

  if (!dayAgenda || (totalItemCount === 0 && unfinishedItems.length === 0)) {
    return (
      <View style={styles.emptyDay}>
        <AppIcon name="calendar" size={28} color={theme.text.muted} />
        <Text style={styles.emptyTitle}>No tasks scheduled</Text>
        <Text style={styles.emptySubtitle}>{selectedDateStr}</Text>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={onScheduleTask}
        >
          <Text style={styles.scheduleButtonText}>+ Schedule a task</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections: AgendaSection[] = [
    {
      title: "Unfinished",
      icon: "alert-circle" as AppIconName,
      data: unfinishedItems,
    },
    { title: "Time Blocks", icon: "clock" as AppIconName, data: timeBlocks },
    { title: "All Day", icon: "sun" as AppIconName, data: allDayTasks },
  ].filter((section) => section.data.length > 0);

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
      ListHeaderComponent={
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderRow} />
          {wakeupItem && (
            <View style={styles.specialSection}>
              <Text style={styles.specialTitle}>Wake up</Text>
              <AgendaItemCard
                item={wakeupItem}
                sleepMode="wakeup"
                onPress={() => onItemPress(wakeupItem)}
                onLongPress={() => onItemLongPress(wakeupItem)}
                onToggleComplete={() => onToggleComplete(wakeupItem)}
              />
            </View>
          )}
          {stepItem && (
            <View style={styles.specialSection}>
              <Text style={styles.specialTitle}>Steps</Text>
              <AgendaItemCard
                item={stepItem}
                onPress={() => onItemPress(stepItem)}
                onLongPress={() => onItemLongPress(stepItem)}
                onToggleComplete={() => onToggleComplete(stepItem)}
              />
            </View>
          )}
          {(wakeupItem || stepItem) && <View style={styles.specialDivider} />}
        </View>
      }
      ListFooterComponent={
        sleepItem ? (
          <View style={styles.specialFooter}>
            <View style={styles.specialDivider} />
            <Text style={styles.specialTitle}>Sleep</Text>
            <AgendaItemCard
              item={sleepItem}
              sleepMode="sleep"
              onPress={() => onItemPress(sleepItem)}
              onLongPress={() => onItemLongPress(sleepItem)}
              onToggleComplete={() => onToggleComplete(sleepItem)}
            />
          </View>
        ) : null
      }
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
}

const styles = StyleSheet.create({
  dayListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  dayHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dayHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  specialSection: {
    marginBottom: spacing.md,
  },
  specialFooter: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  specialTitle: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  specialDivider: {
    height: 1,
    backgroundColor: theme.border.secondary,
    marginVertical: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  sectionCountPill: {
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountText: {
    color: theme.text.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyDay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: theme.text.secondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  scheduleButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: theme.background.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  searchLoading: {
    paddingTop: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  searchLoadingText: {
    color: theme.text.secondary,
    fontSize: 12,
  },
  searchEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  searchEmptyTitle: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  searchEmptySubtitle: {
    color: theme.text.secondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  searchSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchSectionText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  searchSectionPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
  },
  searchSectionCount: {
    color: theme.text.muted,
    fontSize: 11,
    fontWeight: "600",
  },
});
