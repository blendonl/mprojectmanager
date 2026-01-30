import { now } from "@utils/dateUtils";

export type AgendaItemStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "UNFINISHED";
export type AgendaItemType = "TASK" | "MEETING" | "SUBTASK";

export interface AgendaItemProps {
  id?: string;
  agendaId: string;
  taskId?: string | null;
  routineTaskId?: string | null;
  routineTaskName?: string | null;
  routineName?: string | null;
  routineType?: string | null;
  routineTarget?: string | null;
  projectId?: string;
  boardId?: string;
  columnId?: string | null;
  taskTitle?: string;
  taskDescription?: string | null;
  taskGoalId?: string | null;
  taskPriority?: string | null;
  projectName?: string;
  boardName?: string;
  columnName?: string | null;
  scheduledDate?: string;
  scheduledTime?: string | null;
  durationMinutes?: number | null;
  taskType?: string;
  meetingData?: any;
  actualValue?: number | null;
  type?: AgendaItemType;
  status?: AgendaItemStatus;
  startAt?: Date | string | null;
  duration?: number | null;
  position?: number;
  notes?: string | null;
  completedAt?: Date | string | null;
  notificationId?: string | null;
  unfinishedAt?: Date | string | null;
  isUnfinished?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class AgendaItem {
  id: string;
  agendaId: string;
  taskId: string | null;
  routineTaskId: string | null;
  routineTaskName: string | null;
  routineName: string | null;
  routineType: string | null;
  routineTarget: string | null;
  projectId: string;
  boardId: string;
  columnId: string | null;
  taskTitle: string;
  taskDescription: string | null;
  taskGoalId: string | null;
  taskPriority: string | null;
  projectName: string;
  boardName: string;
  columnName: string | null;
  scheduledDate: string;
  scheduledTime: string | null;
  durationMinutes: number | null;
  taskType: string;
  meetingData: any;
  actualValue: number | null;
  type: AgendaItemType;
  status: AgendaItemStatus;
  startAt: Date | null;
  duration: number | null;
  position: number;
  notes: string | null;
  completedAt: Date | null;
  notificationId: string | null;
  unfinishedAt: Date | null;
  isUnfinished: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: AgendaItemProps) {
    this.id =
      props.id ||
      `agenda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.agendaId = props.agendaId;
    this.taskId = props.taskId ? props.taskId : null;
    this.routineTaskId = props.routineTaskId ? props.routineTaskId : null;
    this.routineTaskName = props.routineTaskName || null;
    this.routineName = props.routineName || null;
    this.routineType = props.routineType || null;
    this.routineTarget = props.routineTarget || null;
    this.projectId = props.projectId || "";
    this.boardId = props.boardId || "";
    this.columnId = props.columnId || null;
    this.taskTitle = props.taskTitle || "";
    this.taskDescription = props.taskDescription || null;
    this.taskGoalId = props.taskGoalId || null;
    this.taskPriority = props.taskPriority || null;
    this.projectName = props.projectName || "";
    this.boardName = props.boardName || "";
    this.columnName = props.columnName || null;
    this.scheduledDate = props.scheduledDate || "";
    this.scheduledTime = props.scheduledTime || null;
    this.durationMinutes = props.durationMinutes || null;
    this.taskType = props.taskType || "regular";
    this.meetingData = props.meetingData || null;
    this.actualValue = props.actualValue || null;
    this.type = props.type || "TASK";
    this.status = props.status || "PENDING";
    this.startAt =
      props.startAt !== undefined && props.startAt !== null
        ? props.startAt instanceof Date
          ? props.startAt
          : new Date(props.startAt)
        : null;
    this.duration = props.duration ? props.duration : null;
    this.position = props.position ? props.position : 0;
    this.notes = props.notes ? props.notes : null;
    this.completedAt =
      props.completedAt && props.completedAt !== null
        ? props.completedAt instanceof Date
          ? props.completedAt
          : new Date(props.completedAt)
        : null;
    this.notificationId = props.notificationId ? props.notificationId : null;
    this.unfinishedAt =
      props.unfinishedAt && props.unfinishedAt !== null
        ? props.unfinishedAt instanceof Date
          ? props.unfinishedAt
          : new Date(props.unfinishedAt)
        : null;
    this.isUnfinished = props.isUnfinished ? props.isUnfinished : false;

    const created = props.createdAt || now();
    this.createdAt = created instanceof Date ? created : new Date(created);

    const updated = props.updatedAt || now();
    this.updatedAt = updated instanceof Date ? updated : new Date(updated);
  }

  get scheduledDateTime(): Date | null {
    return this.startAt;
  }

  get filename(): string {
    return this.taskId ? `${this.taskId}.md` : `agenda-${this.id}.md`;
  }

  reschedule(date: Date): void {
    this.startAt = date;
    this.updatedAt = now();
  }

  updateDuration(minutes: number): void {
    this.duration = minutes;
    this.updatedAt = now();
  }

  addNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = now();
  }

  markComplete(): void {
    this.completedAt = now();
    this.status = "COMPLETED";
    this.updatedAt = now();
  }

  markIncomplete(): void {
    this.completedAt = null;
    this.status = "PENDING";
    this.updatedAt = now();
  }

  markAsUnfinished(): void {
    this.isUnfinished = true;
    this.unfinishedAt = now();
    this.status = "UNFINISHED";
    this.updatedAt = now();
  }

  clearUnfinished(): void {
    this.isUnfinished = false;
    this.unfinishedAt = null;
    this.status = "PENDING";
    this.updatedAt = now();
  }

  update(updates: Partial<AgendaItemProps>): void {
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "createdAt") {
        (this as any)[key] = value;
      }
    });
    this.updatedAt = now();
  }

  toDict(): Record<string, any> {
    return {
      id: this.id,
      agendaId: this.agendaId,
      taskId: this.taskId,
      routineTaskId: this.routineTaskId,
      routineTaskName: this.routineTaskName,
      routineName: this.routineName,
      routineType: this.routineType,
      routineTarget: this.routineTarget,
      type: this.type,
      status: this.status,
      startAt: this.startAt?.toISOString() ?? null,
      duration: this.duration,
      position: this.position,
      notes: this.notes,
      completedAt: this.completedAt?.toISOString() ?? null,
      notificationId: this.notificationId,
      unfinishedAt: this.unfinishedAt?.toISOString() ?? null,
      isUnfinished: this.isUnfinished,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromDict(data: Record<string, any>): AgendaItem {
    const parseDate = (value: any): Date | undefined => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "string") return new Date(value);
      return undefined;
    };

    return new AgendaItem({
      id: data.id,
      agendaId: data.agendaId || data.agenda_id,
      taskId: data.taskId || data.task_id || null,
      routineTaskId: data.routineTaskId || data.routine_task_id || null,
      routineTaskName: data.routineTaskName || data.routine_task_name || null,
      routineName: data.routineName || data.routine_name || null,
      routineType: data.routineType || data.routine_type || null,
      routineTarget: data.routineTarget || data.routine_target || null,
      projectId: data.projectId || data.project_id || "",
      boardId: data.boardId || data.board_id || "",
      columnId: data.columnId || data.column_id || null,
      taskTitle: data.taskTitle || data.task_title || "",
      taskDescription: data.taskDescription || data.task_description || null,
      taskGoalId: data.taskGoalId || data.task_goal_id || null,
      taskPriority: data.taskPriority || data.task_priority || null,
      projectName: data.projectName || data.project_name || "",
      boardName: data.boardName || data.board_name || "",
      columnName: data.columnName || data.column_name || null,
      scheduledDate: data.scheduledDate || data.scheduled_date || "",
      scheduledTime: data.scheduledTime || data.scheduled_time || null,
      durationMinutes: data.durationMinutes || data.duration_minutes || null,
      taskType: data.taskType || data.task_type || "regular",
      meetingData: data.meetingData || data.meeting_data || null,
      actualValue: data.actualValue || data.actual_value || null,
      type: data.type ?? "TASK",
      status: data.status ?? "PENDING",
      startAt: parseDate(data.startAt || data.start_at) ?? null,
      duration: data.duration ?? null,
      position: data.position ?? 0,
      notes: data.notes ?? null,
      completedAt: parseDate(data.completedAt || data.completed_at) ?? null,
      notificationId: data.notificationId ?? data.notification_id ?? null,
      unfinishedAt: parseDate(data.unfinishedAt || data.unfinished_at) ?? null,
      isUnfinished: data.isUnfinished ?? data.is_unfinished ?? false,
      createdAt: parseDate(data.createdAt || data.created_at),
      updatedAt: parseDate(data.updatedAt || data.updated_at),
    });
  }
}
