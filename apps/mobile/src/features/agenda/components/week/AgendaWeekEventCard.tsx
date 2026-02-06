import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import theme from '@shared/theme/colors';
import { getItemTitle } from '../../utils/agendaHelpers';

interface AgendaWeekEventCardProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
  onLongPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const getAccentColor = (item: AgendaItemEnrichedDto): string => {
  if (item.routineTaskId) return theme.accent.secondary;
  if (item.task?.taskType === 'meeting') return theme.accent.success;
  if (item.task?.taskType === 'milestone') return theme.accent.secondary;
  return theme.accent.primary;
};

export const AgendaWeekEventCard: React.FC<AgendaWeekEventCardProps> = ({
  item,
  onPress,
  onLongPress,
  style,
}) => {
  const title = useMemo(() => getItemTitle(item), [item]);
  const accentColor = useMemo(() => getAccentColor(item), [item]);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: accentColor }, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: theme.card.background,
    borderWidth: 1,
    borderColor: theme.card.border,
    borderLeftWidth: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
