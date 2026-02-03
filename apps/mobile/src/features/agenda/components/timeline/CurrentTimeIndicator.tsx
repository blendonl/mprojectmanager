import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@shared/theme/colors';

interface CurrentTimeIndicatorProps {
  offsetY: number;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({ offsetY }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { top: offsetY }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.status.error,
    marginLeft: 55,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: theme.status.error,
    marginLeft: 4,
  },
});
