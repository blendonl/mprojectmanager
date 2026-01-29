import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import BaseModal from '@shared/components/BaseModal';
import { Input } from '@shared/components/Input';
import { PrimaryButton, SecondaryButton } from '@shared/components/Button';
import theme from '@shared/theme';

interface ColumnFormModalProps {
  visible: boolean;
  isEditing: boolean;
  name: string;
  wipLimit: number | null;
  errors: {
    name?: string;
    wipLimit?: string;
  };
  isSubmitting: boolean;
  onNameChange: (name: string) => void;
  onWipLimitChange: (limit: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const ColumnFormModal: React.FC<ColumnFormModalProps> = ({
  visible,
  isEditing,
  name,
  wipLimit,
  errors,
  isSubmitting,
  onNameChange,
  onWipLimitChange,
  onSave,
  onClose,
}) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Column' : 'New Column'}
    >
      <View style={styles.container}>
        <View style={styles.form}>
          <Input
            label="Column Name"
            value={name}
            onChangeText={onNameChange}
            placeholder="Enter column name"
            autoFocus
            error={errors.name}
            editable={!isSubmitting}
          />

          <Input
            label="WIP Limit (optional)"
            value={wipLimit?.toString() || ''}
            onChangeText={onWipLimitChange}
            placeholder="No limit"
            keyboardType="number-pad"
            helperText="Maximum number of tasks allowed in this column"
            error={errors.wipLimit}
            editable={!isSubmitting}
          />

          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
          {errors.wipLimit && (
            <Text style={styles.errorText}>{errors.wipLimit}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <SecondaryButton
            title="Cancel"
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.button}
          />
          <PrimaryButton
            title={isEditing ? 'Save' : 'Create'}
            onPress={onSave}
            loading={isSubmitting}
            disabled={isSubmitting || !name.trim()}
            style={styles.button}
          />
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: -theme.spacing.sm,
  },
});

export default ColumnFormModal;
