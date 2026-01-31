import { useState, useCallback, useEffect, useRef } from "react";
import { TaskPriority, TaskType } from "shared-types";
import { TaskFormState, TaskFormHook } from "../types";

const getInitialState = (
  initialData?: Partial<TaskFormState>,
): TaskFormState => ({
  title: initialData?.title || "",
  description: initialData?.description || "",
  parentId: initialData?.parentId || null,
  issueType: initialData?.issueType || TaskType.TASK,
  priority: initialData?.priority || TaskPriority.LOW,
});

export function useTaskForm(
  initialData?: Partial<TaskFormState>,
): TaskFormHook {
  const [formState, setFormState] = useState<TaskFormState>(
    getInitialState(initialData),
  );
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (initialData && initialData.title) {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        setFormState(getInitialState(initialData));
      }
    }
  }, [initialData]);

  const updateField = useCallback(
    <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setFormState(getInitialState());
  }, []);

  const isValid = useCallback(() => {
    return formState.title.trim().length > 0;
  }, [formState.title]);

  const getData = useCallback((): TaskFormState => {
    return {
      ...formState,
      title: formState.title.trim(),
      description: formState.description.trim(),
    };
  }, [formState]);

  return {
    formState,
    actions: {
      updateField,
      reset,
      isValid,
      getData,
    },
  };
}
