/**
 * Task priority enumeration
 */

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export type TaskPriorityType = `${TaskPriority}`;
