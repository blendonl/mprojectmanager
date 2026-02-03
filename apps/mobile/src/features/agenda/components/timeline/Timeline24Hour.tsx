import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { TimelineHour } from '../../utils/timelineHelpers';
import { TimeSlot } from './TimeSlot';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { useCurrentTimePosition } from '../../hooks/useCurrentTimePosition';

interface Timeline24HourProps {
  hours: TimelineHour[];
  itemsByHour: Map<number, AgendaItemEnrichedDto[]>;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  flatListRef?: React.RefObject<FlatList | null>;
}

const HOUR_SLOT_HEIGHT = 60;

export const Timeline24Hour: React.FC<Timeline24HourProps> = ({
  hours,
  itemsByHour,
  onItemPress,
  onToggleComplete,
  flatListRef,
}) => {
  const currentTimePosition = useCurrentTimePosition(hours, HOUR_SLOT_HEIGHT);

  const renderItem: ListRenderItem<TimelineHour> = useCallback(
    ({ item }) => {
      const items = itemsByHour.get(item.hour) || [];
      return (
        <TimeSlot
          hour={item.hour}
          label={item.label}
          items={items}
          onItemPress={onItemPress}
          onToggleComplete={onToggleComplete}
        />
      );
    },
    [itemsByHour, onItemPress, onToggleComplete]
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

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={hours}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef?.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
      {currentTimePosition && (
        <CurrentTimeIndicator offsetY={currentTimePosition.offsetY} />
      )}
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
