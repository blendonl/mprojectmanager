import { TaskId, ColumnId, ParentId, Timestamp } from "@core/types";
import { TaskType, TaskPriority, TaskStatus } from "shared-types";

export interface TaskProps {
  id: TaskId;
  slug: string;
  title: string;
  description?: string | null;
  taskType: TaskType;
  status: TaskStatus;
  priority?: TaskPriority | null;
  columnId: ColumnId;
  boardId: string;
  projectId: string;
  goalId?: string | null;
  position: number;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  filePath?: string | null;
  completedAt?: string | null;
  parentId?: ParentId | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class Task {
  id: TaskId;
  slug: string;
  title: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority | null;
  columnId: ColumnId;
  boardId: string;
  projectId: string;
  goalId: string | null;
  position: number;
  dueDate: string | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  filePath: string | null;
  completedAt: string | null;
  parentId: ParentId | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.description = props.description || '';
    this.taskType = props.taskType;
    this.status = props.status;
    this.priority = props.priority ?? null;
    this.columnId = props.columnId;
    this.boardId = props.boardId;
    this.projectId = props.projectId;
    this.goalId = props.goalId ?? null;
    this.position = props.position;
    this.dueDate = props.dueDate ?? null;
    this.estimatedMinutes = props.estimatedMinutes ?? null;
    this.actualMinutes = props.actualMinutes ?? null;
    this.filePath = props.filePath ?? null;
    this.completedAt = props.completedAt ?? null;
    this.parentId = props.parentId ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get hasParent(): boolean {
    return this.parentId !== null;
  }

  get isSubtask(): boolean {
    return this.hasParent;
  }

  get isMeeting(): boolean {
    return this.taskType === TaskType.MEETING;
  }

  get isMilestone(): boolean {
    return this.taskType === TaskType.MILESTONE;
  }

  get isDueSoon(): boolean {
    if (!this.dueDate) return false;
    const dueDate = new Date(this.dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    const dueDate = new Date(this.dueDate);
    return dueDate < new Date();
  }

  toDict(): Record<string, any> {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      description: this.description,
      taskType: this.taskType,
      status: this.status,
      priority: this.priority,
      columnId: this.columnId,
      boardId: this.boardId,
      projectId: this.projectId,
      goalId: this.goalId,
      position: this.position,
      dueDate: this.dueDate,
      estimatedMinutes: this.estimatedMinutes,
      actualMinutes: this.actualMinutes,
      filePath: this.filePath,
      completedAt: this.completedAt,
      parentId: this.parentId,
      createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
    };
  }

  static fromDict(data: any): Task {
    return new Task({
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      taskType: data.taskType,
      status: data.status,
      priority: data.priority,
      columnId: data.columnId,
      boardId: data.boardId,
      projectId: data.projectId,
      goalId: data.goalId,
      position: data.position,
      dueDate: data.dueDate,
      estimatedMinutes: data.estimatedMinutes,
      actualMinutes: data.actualMinutes,
      filePath: data.filePath,
      completedAt: data.completedAt,
      parentId: data.parentId,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }
}
