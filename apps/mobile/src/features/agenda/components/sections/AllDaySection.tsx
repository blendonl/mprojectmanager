import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';
import { AgendaItemCardMinimal } from '../timeline/AgendaItemCardMinimal';

interface AllDaySectionProps {
  items: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

const ALL_DAY_COLLAPSE_KEY = '@agenda_all_day_collapsed';

export const AllDaySection: React.FC<AllDaySectionProps> = ({
  items,
  onItemPress,
  onToggleComplete,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const loadCollapseState = async () => {
      try {
        const saved = await AsyncStorage.getItem(ALL_DAY_COLLAPSE_KEY);
        if (saved !== null) {
          setIsCollapsed(saved === 'true');
        }
      } catch (error) {
        console.error('Failed to load collapse state:', error);
      }
    };

    loadCollapseState();
  }, []);

  const toggleCollapsed = async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      await AsyncStorage.setItem(ALL_DAY_COLLAPSE_KEY, String(newState));
    } catch (error) {
      console.error('Failed to save collapse state:', error);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.header,
          isCollapsed && styles.headerCollapsed,
        ]}
        onPress={toggleCollapsed}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>All Day</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
        </View>
        <AppIcon
          name={isCollapsed ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={theme.text.secondary}
        />
      </TouchableOpacity>
      {!isCollapsed && (
        <View style={styles.content}>
          {items.map(item => (
            <AgendaItemCardMinimal
              key={item.id}
              item={item}
              onPress={() => onItemPress(item)}
              onToggleComplete={() => onToggleComplete(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: theme.background.secondary,
  },
  headerCollapsed: {
    height: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
