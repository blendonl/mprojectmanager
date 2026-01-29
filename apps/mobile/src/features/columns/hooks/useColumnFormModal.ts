import { useState, useCallback, useEffect } from 'react';
import { Column } from '../domain/entities/Column';

interface ColumnFormData {
  name: string;
  wipLimit: number | null;
  color: string;
}

interface ValidationErrors {
  name?: string;
  wipLimit?: string;
}

interface UseColumnFormModalOptions {
  onSubmit: (name: string, wipLimit?: number, columnId?: string) => Promise<void>;
}

interface UseColumnFormModalReturn {
  isVisible: boolean;
  formData: ColumnFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  editingColumn: Column | null;
  openForCreate: () => void;
  openForEdit: (column: Column) => void;
  close: () => void;
  updateFormData: (updates: Partial<ColumnFormData>) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

const DEFAULT_FORM_DATA: ColumnFormData = {
  name: '',
  wipLimit: null,
  color: '#3B82F6',
};

export function useColumnFormModal(
  options: UseColumnFormModalOptions
): UseColumnFormModalReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<ColumnFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Column name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Column name must be 50 characters or less';
    }

    if (formData.wipLimit !== null) {
      if (formData.wipLimit < 1) {
        newErrors.wipLimit = 'WIP limit must be at least 1';
      } else if (formData.wipLimit > 999) {
        newErrors.wipLimit = 'WIP limit must be 999 or less';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const openForCreate = useCallback(() => {
    setEditingColumn(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setIsVisible(true);
  }, []);

  const openForEdit = useCallback((column: Column) => {
    setEditingColumn(column);
    setFormData({
      name: column.name,
      wipLimit: column.limit,
      color: column.color || '#3B82F6',
    });
    setErrors({});
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setEditingColumn(null);
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      setIsSubmitting(false);
    }, 300);
  }, []);

  const updateFormData = useCallback((updates: Partial<ColumnFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    if (editingColumn) {
      setFormData({
        name: editingColumn.name,
        wipLimit: editingColumn.limit,
        color: editingColumn.color || '#3B82F6',
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
    setErrors({});
  }, [editingColumn]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await options.onSubmit(
        formData.name.trim(),
        formData.wipLimit ?? undefined,
        editingColumn?.id
      );
      close();
    } catch (error) {
      setIsSubmitting(false);
    }
  }, [validateForm, options, formData, editingColumn, close]);

  useEffect(() => {
    if (!isVisible) {
      setIsSubmitting(false);
    }
  }, [isVisible]);

  return {
    isVisible,
    formData,
    errors,
    isSubmitting,
    editingColumn,
    openForCreate,
    openForEdit,
    close,
    updateFormData,
    handleSubmit,
    resetForm,
  };
}
