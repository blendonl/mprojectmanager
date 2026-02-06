import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { DateNavigator } from './DateNavigator';

interface AgendaHeaderCompactProps {
  label: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDatePress: () => void;
  onTodayPress: () => void;
}

export const AgendaHeaderCompact: React.FC<AgendaHeaderCompactProps> = ({
  label,
  onPreviousDay,
  onNextDay,
  onDatePress,
  onTodayPress,
}) => {
  return (
    <View style={styles.container}>
      <DateNavigator
        label={label}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onDatePress={onDatePress}
        onTodayPress={onTodayPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: theme.background.primary,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
});
