/**
 * Issue type utilities
 * Centralized logic for issue types and their icons
 */

import { AppIconName } from "@/shared";
import { TaskType } from "shared-types";

/**
 * Mapping of issue types to their icon names
 */
export const ISSUE_TYPE_ICONS: Record<TaskType, AppIconName> = {
  [TaskType.TASK]: "task",
  [TaskType.SUBTASK]: "subtask",
  [TaskType.MEETING]: "task",
} as const;

/**
 * Get the icon for a specific issue type
 * Handles case-insensitive matching and partial matches
 * @param issueType - The issue type string
 * @returns The corresponding icon name
 */
export function getIssueTypeIcon(issueType: string): AppIconName {
  if (!issueType) {
    return ISSUE_TYPE_ICONS[TaskType.TASK];
  }

  const normalizedType = issueType.toLowerCase();

  // Check for exact matches first
  for (const [type, icon] of Object.entries(ISSUE_TYPE_ICONS)) {
    if (type.toLowerCase() === normalizedType) {
      return icon;
    }
  }

  // Check for partial matches
  if (normalizedType.includes("epic")) {
    return ISSUE_TYPE_ICONS[TaskType.TASK];
  } else if (normalizedType.includes("story")) {
    return ISSUE_TYPE_ICONS[TaskType.SUBTASK];
  } else if (normalizedType.includes("bug") || normalizedType.includes("meeting")) {
    return ISSUE_TYPE_ICONS[TaskType.MEETING];
  }

  return ISSUE_TYPE_ICONS[TaskType.TASK];
}

/**
 * Get all available issue types
 * @returns Array of all issue type values
 */
export function getAllIssueTypes(): TaskType[] {
  return [TaskType.TASK, TaskType.SUBTASK, TaskType.MEETING];
}

/**
 * Check if a string is a valid issue type
 * @param issueType - The string to check
 * @returns True if the string is a valid issue type
 */
export function isValidIssueType(issueType: TaskType): boolean {
  return getAllIssueTypes().includes(issueType);
}

/**
 * Get a human-readable label for an issue type
 * @param issueType - The issue type
 * @returns Formatted label with icon
 */
export function getIssueTypeLabel(issueType: string): string {
  return issueType;
}
