import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { SearchMode } from '../types/agenda-screen.types';

interface AgendaSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
}

export function AgendaSearchBar({
  searchQuery,
  onSearchQueryChange,
  searchMode,
  onSearchModeChange,
}: AgendaSearchBarProps) {
  return (
    <View style={styles.searchCard}>
      <View style={styles.searchInputRow}>
        <AppIcon name="search" size={16} color={theme.text.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder="Search tasks, projects, goals"
          placeholderTextColor={theme.text.muted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      {searchQuery.trim().length > 0 && (
        <View style={styles.searchToggleRow}>
          <TouchableOpacity
            style={[
              styles.searchToggleButton,
              searchMode === 'all' && styles.searchToggleButtonActive,
            ]}
            onPress={() => onSearchModeChange('all')}
          >
            <Text
              style={[
                styles.searchToggleText,
                searchMode === 'all' && styles.searchToggleTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchToggleButton,
              searchMode === 'unfinished' && styles.searchToggleButtonActive,
            ]}
            onPress={() => onSearchModeChange('unfinished')}
          >
            <Text
              style={[
                styles.searchToggleText,
                searchMode === 'unfinished' && styles.searchToggleTextActive,
              ]}
            >
              Unfinished
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border.primary,
    backgroundColor: theme.background.secondary,
    gap: spacing.xs,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: theme.text.primary,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchToggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
  },
  searchToggleButtonActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary,
  },
  searchToggleText: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  searchToggleTextActive: {
    color: theme.background.primary,
    fontWeight: '700',
  },
});
