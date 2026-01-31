import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useAnimatedReaction, useSharedValue, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BoardColumnDto, TaskDto } from 'shared-types';
import { ColumnCard } from '@features/columns/components';
import { Parent } from '@domain/entities/Parent';
import { useBoardDrag } from './BoardDragContext';

interface DroppableColumnProps {
  column: BoardColumnDto;
  tasks: TaskDto[];
  parents?: Parent[];
  showParentGroups?: boolean;
  onTaskPress: (task: TaskDto) => void;
  onAddTask: () => void;
  onColumnMenu?: () => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onValidateDrop?: (taskId: string, columnId: string) => Promise<{ valid: boolean; reason?: string }>;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  registerVerticalScroll?: (
    columnId: string,
    ref: React.RefObject<FlatList | null>,
    contentHeight: number,
    viewportHeight: number
  ) => void;
  handleVerticalScroll?: (columnId: string, offset: number) => void;
  unregisterVerticalScroll?: (columnId: string) => void;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  tasks,
  parents = [],
  showParentGroups = false,
  onTaskPress,
  onAddTask,
  onColumnMenu,
  onDragStart,
  onDragEnd,
  onValidateDrop,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  registerVerticalScroll,
  handleVerticalScroll,
  unregisterVerticalScroll,
}) => {
  const { isDragging, dragPosition, draggedTaskId, updateTarget, activeColumnId } = useBoardDrag();
  const [isValidDrop, setIsValidDrop] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const columnRef = useRef<View | null>(null);
  const lastHapticFeedback = useSharedValue(0);
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState(false);

  const checkIfHovering = useCallback(() => {
    if (!isDragging.value) {
      setIsHovering(false);
      return;
    }

    const dragX = dragPosition.value.x;
    const dragY = dragPosition.value.y;
    const view = columnRef.current;

    if (!view) {
      setIsHovering(false);
      return;
    }

    view.measureInWindow((x, y, width, height) => {
      const hovering =
        dragX >= x &&
        dragX <= x + width &&
        dragY >= y &&
        dragY <= y + height;

      setIsHovering(hovering);

      if (hovering) {
        activeColumnId.value = column.id;
      } else if (activeColumnId.value === column.id) {
        activeColumnId.value = null;
      }

      if (hovering && draggedTaskId.value) {
        updateTarget(column.id, -1);

        if (onValidateDrop) {
          onValidateDrop(draggedTaskId.value, column.id).then((result) => {
            setIsValidDrop(result.valid);

            const now = Date.now();
            if (now - lastHapticFeedback.value > 200) {
              lastHapticFeedback.value = now;
              if (result.valid) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
          });
        }
      }
    });
  }, [
    isDragging,
    dragPosition,
    draggedTaskId,
    column.id,
    onValidateDrop,
    updateTarget,
    activeColumnId,
    lastHapticFeedback,
  ]);

  useAnimatedReaction(
    () => isDragging.value,
    (dragging) => {
      runOnJS(setIsCurrentlyDragging)(dragging);
    },
    [isDragging]
  );

  useEffect(() => {
    if (isCurrentlyDragging) {
      const interval = setInterval(checkIfHovering, 100);
      return () => clearInterval(interval);
    }
  }, [isCurrentlyDragging, checkIfHovering]);

  return (
    <View ref={columnRef} style={styles.container}>
      <ColumnCard
        column={column}
        tasks={tasks}
        parents={parents}
        showParentGroups={showParentGroups}
        onTaskPress={onTaskPress}
        onAddTask={onAddTask}
        onColumnMenu={onColumnMenu}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        registerVerticalScroll={registerVerticalScroll}
        handleVerticalScroll={handleVerticalScroll}
        unregisterVerticalScroll={unregisterVerticalScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: '100%',
    alignSelf: 'stretch',
  },
});
