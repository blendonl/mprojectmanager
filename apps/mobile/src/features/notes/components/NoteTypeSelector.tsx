import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { NoteType } from 'shared-types';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';

const NOTE_TYPES: { value: NoteType; label: string; icon: AppIconName }[] = [
  { value: NoteType.General, label: 'Note', icon: 'note' },
  { value: NoteType.Meeting, label: 'Meeting', icon: 'users' },
  { value: NoteType.Daily, label: 'Daily', icon: 'calendar' },
  { value: NoteType.Task, label: 'Task', icon: 'check' },
];

interface NoteTypeSelectorProps {
  selectedType: NoteType;
  onTypeChange: (type: NoteType) => void;
  disabled?: boolean;
}

export const NoteTypeSelector: React.FC<NoteTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
}) => {
  return (
    <View style={styles.typeSelector}>
      <Text style={styles.sectionLabel}>Note Type</Text>
      <View style={styles.typeButtons}>
        {NOTE_TYPES.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              selectedType === type.value && styles.typeButtonActive,
            ]}
            onPress={() => onTypeChange(type.value)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <AppIcon
              name={type.icon}
              size={16}
              color={selectedType === type.value ? theme.background.primary : theme.text.secondary}
            />
            <Text style={[
              styles.typeLabel,
              selectedType === type.value && styles.typeLabelActive,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelector: {
    padding: spacing.lg,
  },
  sectionLabel: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + '20',
  },
  typeLabel: {
    color: theme.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  typeLabelActive: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
});
