/**
 * Task entity - aligned with backend schema
 * Scheduling moved to AgendaItem, business logic moved to backend
 */

import { TaskId, ColumnId, ParentId, Timestamp, FilePath } from "@core/types";
import { now } from "@utils/dateUtils";
import { generateIdFromName } from "@utils/stringUtils";
import { TaskType, TaskPriority, TaskStatus } from '@mprojectmanager/shared-types';

export interface TaskProps {
  id?: TaskId;
  column_id: ColumnId;
  parent_id?: ParentId | null;
  title: string;
  description?: string;
  position?: number;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_at?: Date | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  file_path?: FilePath | null;
}

export class Task {
  id: TaskId;
  column_id: ColumnId;
  parent_id: ParentId | null;
  title: string;
  description: string;
  position: number;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: Date | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  file_path: FilePath | null;

  constructor(props: TaskProps) {
    this.title = props.title;
    this.column_id = props.column_id;
    this.description = props.description || "";
    this.parent_id = props.parent_id !== undefined ? props.parent_id : null;
    this.position = props.position ?? 0;
    this.type = props.type || TaskType.REGULAR;
    this.priority = props.priority || TaskPriority.LOW;
    this.status = props.status || TaskStatus.TODO;
    this.due_at = props.due_at !== undefined ? props.due_at : null;
    this.created_at = props.created_at || now();
    this.updated_at = props.updated_at || now();
    this.file_path = props.file_path !== undefined ? props.file_path : null;

    if (props.id) {
      this.id = props.id;
    } else if (this.file_path) {
      const filename = this.file_path.split("/").pop() || "";
      const stem = filename.replace(/\.md$/, "");
      const parts = stem.split("-");
      if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
        this.id = `${parts[0]}-${parts[1]}`;
      } else {
        this.id = stem;
      }
      if (!this.title || this.title === stem) {
        this.title = stem;
      }
    } else {
      this.id = generateIdFromName(this.title) || "unnamed_task";
    }
  }

  update(updates: Partial<TaskProps>): void {
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        (this as any)[key] = value;
      }
    });
    this.updated_at = now();
  }

  setParent(parentId: ParentId | null): void {
    this.parent_id = parentId;
    this.updated_at = now();
  }

  get hasParent(): boolean {
    return this.parent_id !== null;
  }

  get isSubtask(): boolean {
    return this.hasParent;
  }

  get isMeeting(): boolean {
    return this.type === TaskType.MEETING;
  }

  get isMilestone(): boolean {
    return this.type === TaskType.MILESTONE;
  }

  get isDueSoon(): boolean {
    if (!this.due_at) return false;
    const dueDate = this.due_at instanceof Date ? this.due_at : new Date(this.due_at);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  }

  get isOverdue(): boolean {
    if (!this.due_at) return false;
    const dueDate = this.due_at instanceof Date ? this.due_at : new Date(this.due_at);
    return dueDate < new Date();
  }

  toDict(): Record<string, any> {
    const result: Record<string, any> = {
      id: this.id,
      title: this.title,
      column_id: this.column_id,
      description: this.description,
      parent_id: this.parent_id,
      position: this.position,
      type: this.type,
      priority: this.priority,
      status: this.status,
      created_at: this.created_at instanceof Date ? this.created_at.toISOString() : this.created_at,
      updated_at: this.updated_at instanceof Date ? this.updated_at.toISOString() : this.updated_at,
    };

    if (this.due_at) {
      result.due_at = this.due_at instanceof Date ? this.due_at.toISOString() : this.due_at;
    }

    if (this.file_path) {
      result.file_path = this.file_path;
    }

    return result;
  }

  static fromDict(data: Record<string, any>): Task {
    return new Task({
      id: data.id,
      title: data.title,
      column_id: data.column_id,
      description: data.description,
      parent_id: data.parent_id,
      position: data.position ?? 0,
      type: data.type || TaskType.REGULAR,
      priority: data.priority || TaskPriority.LOW,
      status: data.status || TaskStatus.TODO,
      due_at: data.due_at ? new Date(data.due_at) : null,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
      file_path: data.file_path,
    });
  }
}
