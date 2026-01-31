import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import { TaskCard } from '@features/tasks/components';
import { useBoardDrag } from './BoardDragContext';

interface DraggableTaskCardProps {
  task: TaskDto;
  parent?: Parent;
  onPress: () => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
}

const LONG_PRESS_DURATION = 500;

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  parent,
  onPress,
  onDragStart,
  onDragEnd,
}) => {
  const dragContext = useBoardDrag();

  const opacity = useSharedValue(1);
  const isDraggingThis = useSharedValue(false);

  const taskIdRef = useRef(task.id);
  const taskRef = useRef(task);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    taskIdRef.current = task.id;
    taskRef.current = task;
    onDragStartRef.current = onDragStart;
    onDragEndRef.current = onDragEnd;
  }, [task.id, task, onDragStart, onDragEnd]);

  const handleDragStartCallback = useCallback(() => {
    console.log('[DraggableTaskCard] handleDragStartCallback', taskIdRef.current);
    if (onDragStartRef.current && taskRef.current) {
      onDragStartRef.current(taskRef.current);
    }
  }, []);

  const handleDragEndCallback = useCallback((targetId: string | null) => {
    console.log('[DraggableTaskCard] handleDragEndCallback', taskIdRef.current, targetId);
    if (onDragEndRef.current && taskIdRef.current) {
      onDragEndRef.current(taskIdRef.current, targetId);
    }
  }, []);

  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart((event) => {
      'worklet';
      console.log('A');
      isDraggingThis.value = true;
      console.log('B');
      dragContext.isDragging.value = true;
      console.log('C');
      dragContext.draggedTaskId.value = taskIdRef.current;
      console.log('D');
      dragContext.dragPosition.value = { x: event.absoluteX, y: event.absoluteY };
      console.log('E');
      dragContext.targetColumnId.value = null;
      console.log('F');
      dragContext.targetIndex.value = -1;
      console.log('G');
      opacity.value = 0;
      console.log('H');
      runOnJS(handleDragStartCallback)();
      console.log('I');
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (isDraggingThis.value) {
        dragContext.dragPosition.value = { x: event.absoluteX, y: event.absoluteY };
      }
    })
    .onEnd(() => {
      'worklet';
      console.log('[DraggableTaskCard] pan onEnd');
      if (isDraggingThis.value) {
        isDraggingThis.value = false;
        opacity.value = 1;

        dragContext.isDragging.value = false;

        const targetId = dragContext.targetColumnId.value;
        runOnJS(handleDragEndCallback)(targetId);

        dragContext.draggedTaskId.value = null;
        dragContext.targetColumnId.value = null;
        dragContext.targetIndex.value = -1;
      }
    });

  const composedGesture = Gesture.Race(
    Gesture.Simultaneous(longPressGesture, panGesture),
    Gesture.Tap().onStart(() => {
      'worklet';
      runOnJS(onPress)();
    })
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isDraggingThis.value ? opacity.value : 1,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={animatedStyle}>
        <TaskCard task={task} parent={parent} onPress={() => {}} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({});
