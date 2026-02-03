import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ListRenderItem,
  RefreshControl,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { theme } from '@shared/theme/colors';
import { AgendaItemEnrichedDto } from 'shared-types';
import { TimelineHour } from '../../utils/timelineHelpers';
import { TimeSlot } from './TimeSlot';
import { useCurrentTimePosition } from '../../hooks/useCurrentTimePosition';

interface Timeline24HourProps {
  hours: TimelineHour[];
  itemsByHour: Map<number, AgendaItemEnrichedDto[]>;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  flatListRef?: React.RefObject<FlatList | null>;
  selectedDate?: Date;
  wakeUpHour?: number;
  sleepHour?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerComponent?: React.ReactElement;
}

const HOUR_SLOT_HEIGHT = 60;

export const Timeline24Hour: React.FC<Timeline24HourProps> = ({
  hours,
  itemsByHour,
  onItemPress,
  onToggleComplete,
  flatListRef,
  selectedDate,
  wakeUpHour,
  sleepHour,
  refreshing = false,
  onRefresh,
  headerComponent,
}) => {
  const currentTimePosition = useCurrentTimePosition(hours, HOUR_SLOT_HEIGHT);

  const isToday = React.useMemo(() => {
    if (!selectedDate) return true;
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }, [selectedDate]);

  const renderItem: ListRenderItem<TimelineHour> = useCallback(
    ({ item }) => {
      const items = itemsByHour.get(item.hour) || [];
      const isWakeUpTime = wakeUpHour !== undefined && item.hour === wakeUpHour;
      const isSleepTime = sleepHour !== undefined && item.hour === sleepHour;
      const currentTimeOffset =
        isToday && currentTimePosition && currentTimePosition.hour === item.hour
          ? (currentTimePosition.minute / 60) * HOUR_SLOT_HEIGHT
          : undefined;

      return (
        <TimeSlot
          hour={item.hour}
          label={item.label}
          items={items}
          onItemPress={onItemPress}
          onToggleComplete={onToggleComplete}
          isWakeUpTime={isWakeUpTime}
          isSleepTime={isSleepTime}
          currentTimeOffset={currentTimeOffset}
        />
      );
    },
    [itemsByHour, onItemPress, onToggleComplete, wakeUpHour, sleepHour, isToday, currentTimePosition]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: HOUR_SLOT_HEIGHT,
      offset: HOUR_SLOT_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: TimelineHour) => `hour-${item.hour}`, []);
  const shouldCaptureScroll = useCallback(
    (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const dx = Math.abs(gestureState.dx);
      const dy = Math.abs(gestureState.dy);
      return dy > dx;
    },
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={hours}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={headerComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        onMoveShouldSetResponderCapture={shouldCaptureScroll}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent.primary}
              colors={[theme.accent.primary]}
            />
          ) : undefined
        }
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef?.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    paddingBottom: 100,
  },
});
