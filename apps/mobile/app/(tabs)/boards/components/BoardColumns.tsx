import React, { useRef, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import theme from "@/shared/theme";
import { BoardColumnDto, TaskDto } from "shared-types";
import { DragOverlay, DroppableColumn, useBoardDrag } from "@/features/boards/components/drag-drop";
import { useAutoScroll } from "@/features/boards/hooks/useAutoScroll";
import { useBoardTasks } from "@/features/boards/hooks";

interface BoardColumnsProps {
  columns: BoardColumnDto[];
  bottomPadding: number;
  onTaskPress: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onAddTask: (columnId: string) => void;
  draggedTask?: TaskDto | null;
}

export default function BoardColumns({
  columns,
  bottomPadding,
  onTaskPress,
  onDragStart,
  onDragEnd,
  onAddTask,
  draggedTask,
}: BoardColumnsProps) {
  const dragContext = useBoardDrag();
  const listRef = useRef<FlatList<BoardColumnDto>>(null);
  const {
    handleHorizontalScroll,
    handleHorizontalContentSize,
    handleHorizontalLayout,
    registerVerticalScroll,
    handleVerticalScroll,
    unregisterVerticalScroll,
  } = useAutoScroll({
    dragPosition: dragContext.dragPosition,
    isDragging: dragContext.isDragging,
    activeColumnId: dragContext.activeColumnId,
    horizontalScrollRef: listRef,
  });

  const {
    loadInitialTasks,
    loadMoreTasks,
    getTasksForColumn,
    isLoadingMore,
    hasMore,
  } = useBoardTasks({ columns });

  useEffect(() => {
    loadInitialTasks();
  }, [loadInitialTasks]);

  return (
    <>
      <FlatList
        ref={listRef}
        style={styles.list}
        horizontal
        data={columns}
        keyExtractor={(column) => column.id}
        renderItem={({ item: column }) => (
          <DroppableColumn
            column={column}
            tasks={getTasksForColumn(column.id)}
            onTaskPress={onTaskPress}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onAddTask={() => onAddTask(column.id)}
            onLoadMore={() => loadMoreTasks(column.id)}
            isLoadingMore={isLoadingMore(column.id)}
            hasMore={hasMore(column.id)}
            registerVerticalScroll={registerVerticalScroll}
            handleVerticalScroll={handleVerticalScroll}
            unregisterVerticalScroll={unregisterVerticalScroll}
          />
        )}
        showsHorizontalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={[
          styles.columnsContainer,
          { paddingBottom: bottomPadding },
        ]}
        snapToInterval={296}
        snapToAlignment="start"
        decelerationRate="fast"
        onLayout={(event) => {
          handleHorizontalLayout(event.nativeEvent.layout.width);
        }}
        onContentSizeChange={(width) => {
          handleHorizontalContentSize(width);
        }}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          handleHorizontalScroll(
            contentOffset.x,
            contentSize?.width,
            layoutMeasurement?.width,
          );
        }}
        scrollEventThrottle={16}
      />
      <DragOverlay task={draggedTask ?? null} />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  columnsContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "stretch",
  },
});
