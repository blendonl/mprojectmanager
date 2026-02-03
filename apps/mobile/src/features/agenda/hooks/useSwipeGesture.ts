import { useEffect, useRef } from 'react';
import { PanResponder, Animated, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SwipeGestureConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
  edgeSwipeWidth?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  enabled = true,
  edgeSwipeWidth = 32,
}: SwipeGestureConfig) => {
  const pan = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const configRef = useRef({
    onSwipeLeft,
    onSwipeRight,
    threshold,
    enabled,
    edgeSwipeWidth,
  });
  const widthRef = useRef(width);

  useEffect(() => {
    configRef.current = {
      onSwipeLeft,
      onSwipeRight,
      threshold,
      enabled,
      edgeSwipeWidth,
    };
  }, [onSwipeLeft, onSwipeRight, threshold, enabled, edgeSwipeWidth]);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!configRef.current.enabled) return false;
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        // Only capture if horizontal movement is significantly greater than vertical
        // and there's minimal vertical movement (to avoid blocking scrolls)
        const isHorizontalSwipe = dx > 20 && dy < 10 && dx > dy * 2;
        if (!isHorizontalSwipe) return false;
        const screenWidth = widthRef.current;
        if (!screenWidth) return true;
        const edgeWidth = Math.min(configRef.current.edgeSwipeWidth, screenWidth / 2);
        const startX = gestureState.x0;
        return startX <= edgeWidth || startX >= screenWidth - edgeWidth;
      },
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > configRef.current.threshold) {
          if (gestureState.dx > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            configRef.current.onSwipeRight();
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            configRef.current.onSwipeLeft();
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
