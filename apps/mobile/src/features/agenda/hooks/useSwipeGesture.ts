import { useRef } from 'react';
import { PanResponder, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SwipeGestureConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  enabled = true,
}: SwipeGestureConfig) => {
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enabled && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > threshold) {
          if (gestureState.dx > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSwipeRight();
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSwipeLeft();
          }
        }

        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      {
        translateX: pan.interpolate({
          inputRange: [-threshold * 2, 0, threshold * 2],
          outputRange: [-50, 0, 50],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity: pan.interpolate({
      inputRange: [-threshold * 2, 0, threshold * 2],
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    }),
  };

  return { panResponder, animatedStyle };
};
