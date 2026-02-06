import React from 'react';
import { FlatList } from 'react-native';
import { AgendaDayHourSlotDto, AgendaDayViewDto, AgendaItemEnrichedDto } from 'shared-types';
import { AgendaTimelineView } from '../timeline/AgendaTimelineView';
import { Timeline24Hour } from '../timeline/Timeline24Hour';
import { SpecialItemsHeader } from '../sections/SpecialItemsHeader';
import { AllDaySection } from '../sections/AllDaySection';

interface AgendaDayViewProps {
  view: AgendaDayViewDto;
  refreshing: boolean;
  onRefresh: () => void;
  onScheduleTask: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  flatListRef?: React.RefObject<FlatList<AgendaDayHourSlotDto> | null>;
}

export const AgendaDayView: React.FC<AgendaDayViewProps> = ({
  view,
  refreshing,
  onRefresh,
  onScheduleTask,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
  flatListRef,
}) => {
  return (
    <AgendaTimelineView
      isEmpty={view.isEmpty}
      emptyStateLabel={view.label}
      emptyStateIsToday={view.isToday}
      onScheduleTask={onScheduleTask}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Timeline24Hour
        slots={view.hours}
        onItemPress={onItemPress}
        onToggleComplete={onToggleComplete}
        flatListRef={flatListRef}
        isToday={view.isToday}
        wakeUpHour={view.wakeUpHour ?? undefined}
        sleepHour={view.sleepHour ?? undefined}
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerComponent={
          <>
            <SpecialItemsHeader
              wakeupItem={view.specialItems.wakeup}
              stepItem={view.specialItems.step}
              onItemPress={onItemPress}
              onItemLongPress={onItemLongPress}
              onToggleComplete={onToggleComplete}
            />
            <AllDaySection
              items={view.allDayItems}
              onItemPress={onItemPress}
              onToggleComplete={onToggleComplete}
            />
          </>
        }
      />
    </AgendaTimelineView>
  );
};
