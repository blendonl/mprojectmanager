import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
} from 'react-native-reanimated';
import { TaskCard } from '@features/tasks/components';
import { TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import { useBoardDrag } from './BoardDragContext';
import theme from '@shared/theme';

interface DragOverlayProps {
  task: TaskDto | null;
  parent?: Parent;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DragOverlay: React.FC<DragOverlayProps> = ({ task, parent }) => {
  const { dragPosition, isDragging } = useBoardDrag();

  const animatedStyle = useAnimatedStyle(() => {
    if (!isDragging.value) {
      return {
        opacity: 0,
        transform: [{ scale: 0.8 }],
      };
    }

    return {
      opacity: 1,
      transform: [
        { translateX: dragPosition.value.x - 160 },
        { translateY: dragPosition.value.y - 40 },
        { scale: 1.05 },
      ],
    };
  });

  if (!task) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none">
      <View style={styles.cardContainer}>
        <TaskCard task={task} parent={parent} onPress={() => {}} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    width: 320,
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
});
