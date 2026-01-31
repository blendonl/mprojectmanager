import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@shared/components/Screen";
import AutoSaveIndicator from "@shared/components/AutoSaveIndicator";
import { TaskTitleInput } from "@/features/tasks/components/TaskTitleInput";
import { TaskDescriptionEditor } from "@/features/tasks/components/TaskDescriptionEditor";
import { TaskPriorityPicker } from "@/features/tasks/components/TaskPriorityPicker";
import { TaskIssueTypePicker } from "@/features/tasks/components/TaskIssueTypePicker";
import { TaskParentPicker } from "@/features/tasks/components/TaskParentPicker";
import { TaskDetailMetaBar } from "@/features/tasks/components/TaskDetailMetaBar";
import { TaskDetailHeader } from "@/features/tasks/components/TaskDetailHeader";
import { TaskScheduler } from "@/features/tasks";
import { useTaskForm } from "@/features/tasks/hooks/useTaskForm";
import { useTaskDetailData } from "@/features/tasks/hooks/useTaskDetailData";
import { useTaskAutoSave } from "@/features/tasks/hooks/useTaskAutoSave";
import { useTaskDetailActions } from "@/features/tasks/hooks/useTaskDetailActions";
import { useMetaPickerState } from "@/features/tasks/hooks/useMetaPickerState";
import { LoadingState } from "@/features/tasks/components/LoadingState";
import theme from "@shared/theme/colors";
import { spacing } from "@shared/theme/spacing";
import { TaskPriority, TaskType } from "shared-types";

export default function TaskDetailRoute() {
  const { boardId, taskId, columnId } = useLocalSearchParams<{
    boardId: string;
    taskId?: string;
    columnId?: string;
  }>();
  const router = useRouter();

  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const currentTaskId = taskId ?? createdTaskId;
  const isCreateMode = !currentTaskId;

  const { task, allTasks, loading } = useTaskDetailData({
    boardId,
    taskId: currentTaskId,
  });

  const initialFormData = React.useMemo(
    () => ({
      title: task?.title || "",
      description: task?.description || "",
      parentId: task?.parentId || null,
      issueType: task?.taskType || TaskType.TASK,
      priority: task?.priority || TaskPriority.LOW,
    }),
    [task],
  );

  const { formState, actions } = useTaskForm(initialFormData);

  const { activeMetaPicker, togglePicker, closePicker } = useMetaPickerState();

  const handleTaskCreated = (newTask: any) => {
    setCreatedTaskId(newTask.id);
  };

  const { saveStatus } = useTaskAutoSave({
    task,
    columnId: columnId || task?.columnId || "",
    formState,
    onTaskCreated: handleTaskCreated,
  });

  const { handleDelete } = useTaskDetailActions({ task });

  const selectedParent = formState.parentId
    ? allTasks.find((t) => t.id === formState.parentId) || null
    : null;

  const getColumnName = () => {
    if (columnId) return undefined;
    if (!task) return undefined;
    return task.column.name;
  };

  const handleSchedulePress = () => {
    if (!task) return;
    setShowScheduleModal(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (showParentPicker) {
    return (
      <TaskParentPicker
        tasks={allTasks}
        loading={false}
        selectedParentId={formState.parentId}
        onSelect={(parentId) => actions.updateField("parentId", parentId)}
        onClose={() => setShowParentPicker(false)}
      />
    );
  }

  return (
    <Screen style={styles.container} scrollable={false}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        <AutoSaveIndicator status={saveStatus} />
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {!isCreateMode && <TaskDetailHeader onDelete={handleDelete} />}

          <TaskDetailMetaBar
            priority={formState.priority}
            issueType={formState.issueType}
            selectedParent={selectedParent}
            columnName={getColumnName()}
            activeMetaPicker={activeMetaPicker}
            onPriorityPress={() => togglePicker("priority")}
            onIssueTypePress={() => togglePicker("issueType")}
            onParentPress={() => setShowParentPicker(true)}
            isCreateMode={isCreateMode}
            task={task}
            boardId={boardId}
            onSchedulePress={!isCreateMode ? handleSchedulePress : undefined}
          />

          {activeMetaPicker === "priority" && (
            <TaskPriorityPicker
              selectedPriority={formState.priority}
              onSelect={(priority) => {
                actions.updateField("priority", priority);
                closePicker();
              }}
            />
          )}

          {activeMetaPicker === "issueType" && (
            <TaskIssueTypePicker
              selectedIssueType={formState.issueType}
              onSelect={(issueType) => {
                actions.updateField("issueType", issueType);
                closePicker();
              }}
            />
          )}

          <TaskTitleInput
            value={formState.title}
            onChangeText={(text) => actions.updateField("title", text)}
            placeholder="Untitled task"
            autoFocus={isCreateMode}
          />

          <TaskDescriptionEditor
            value={formState.description}
            onChangeText={(text) => actions.updateField("description", text)}
            placeholder="Start writing your task details..."
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      <TaskScheduler
        task={task}
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
