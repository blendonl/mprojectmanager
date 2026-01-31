import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Task } from "../domain/entities/Task";
import AppIcon from "@shared/components/icons/AppIcon";
import theme from "@shared/theme/colors";
import { spacing } from "@shared/theme/spacing";
import { getIssueTypeIcon } from "@utils/issueTypeUtils";
import { MetaPickerType } from "../hooks/useMetaPickerState";
import { TaskScheduleChip } from "./TaskScheduleChip";
import { PRIORITY_OPTIONS } from "../constants/priorities";
import { TaskPriority } from "shared-types";

interface TaskDetailMetaBarProps {
  priority: TaskPriority;
  issueType: string;
  selectedParent: Task | null;
  columnName?: string;
  activeMetaPicker: MetaPickerType;
  onPriorityPress: () => void;
  onIssueTypePress: () => void;
  onParentPress: () => void;
  isCreateMode: boolean;
  task?: Task | null;
  boardId?: string;
  onSchedulePress?: () => void;
}

export const TaskDetailMetaBar: React.FC<TaskDetailMetaBarProps> = ({
  priority,
  issueType,
  selectedParent,
  columnName,
  activeMetaPicker,
  onPriorityPress,
  onIssueTypePress,
  onParentPress,
  isCreateMode,
  task,
  boardId,
  onSchedulePress,
}) => {
  const selectedPriority =
    PRIORITY_OPTIONS.find((option) => option.value === priority) ||
    PRIORITY_OPTIONS[3];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={[
            styles.metaChip,
            activeMetaPicker === "priority" && styles.metaChipActive,
          ]}
          onPress={onPriorityPress}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: selectedPriority.color },
            ]}
          />
          <Text style={styles.metaChipText}>
            Priority: {selectedPriority.label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metaChip,
            activeMetaPicker === "issueType" && styles.metaChipActive,
          ]}
          onPress={onIssueTypePress}
          activeOpacity={0.85}
        >
          <AppIcon
            name={getIssueTypeIcon(issueType)}
            size={16}
            color={theme.text.secondary}
          />
          <Text style={styles.metaChipText}>{issueType}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metaChip}
          onPress={onParentPress}
          activeOpacity={0.85}
        >
          {selectedParent ? (
            <Text style={styles.metaChipText}>
              Parent: {selectedParent.title}
            </Text>
          ) : (
            <Text style={styles.metaChipText}>Parent: None</Text>
          )}
        </TouchableOpacity>

        {columnName && (
          <View style={styles.metaChipStatic}>
            <AppIcon name="stack" size={16} color={theme.text.secondary} />
            <Text style={styles.metaChipText}>{columnName}</Text>
          </View>
        )}

        {!isCreateMode && task && onSchedulePress && (
          <TaskScheduleChip
            scheduledDate={(task as any).scheduled_date}
            scheduledTime={(task as any).scheduled_time}
            onPress={onSchedulePress}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  content: {
    gap: spacing.sm,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  metaChipActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + "20",
  },
  metaChipStatic: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  metaChipText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
