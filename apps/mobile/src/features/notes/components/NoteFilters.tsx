import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import { NoteType } from 'shared-types';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';

const NOTE_TYPE_FILTERS: { value: NoteType | 'all'; label: string; icon: AppIconName }[] = [
  { value: 'all', label: 'All', icon: 'stack' },
  { value: NoteType.General, label: 'Notes', icon: 'note' },
  { value: NoteType.Meeting, label: 'Meetings', icon: 'users' },
  { value: NoteType.Daily, label: 'Daily', icon: 'calendar' },
  { value: NoteType.Task, label: 'Tasks', icon: 'check' },
];

interface NoteFiltersProps {
  searchQuery: string;
  selectedType: NoteType | 'all';
  onSearchChange: (query: string) => void;
  onTypeChange: (type: NoteType | 'all') => void;
}

export const NoteFilters: React.FC<NoteFiltersProps> = ({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <AppIcon name="search" size={16} color={theme.text.muted} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={theme.text.muted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Text style={styles.clearButton}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFilters}
      >
        {NOTE_TYPE_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedType === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => onTypeChange(filter.value)}
          >
            <View style={styles.filterIcon}>
              <AppIcon
                name={filter.icon}
                size={14}
                color={selectedType === filter.value ? theme.background.primary : theme.text.secondary}
              />
            </View>
            <Text style={[
              styles.filterLabel,
              selectedType === filter.value && styles.filterLabelActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.text.primary,
    fontSize: 15,
  },
  clearButton: {
    fontSize: 24,
    color: theme.text.muted,
    fontWeight: '300',
  },
  typeFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: theme.accent.primary + '25',
    borderColor: theme.accent.primary,
  },
  filterIcon: {
    marginRight: spacing.xs,
  },
  filterLabel: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
});
