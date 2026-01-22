import { AgendaItem } from "../domain/entities/AgendaItem";
import { Task } from "../domain/entities/Task";
import { AgendaRepository } from "../domain/repositories/AgendaRepository";
import { NotificationService } from "@services/NotificationService";
import { logger } from "@utils/logger";
import { BoardId, TaskId, ProjectId } from "@core/types";
import {
  ScheduledAgendaItem,
  ScheduledTask,
  DayAgenda,
  CreateAgendaItemRequest,
  UpdateAgendaItemRequest,
  RescheduleAgendaItemRequest,
  ScheduleTaskRequest,
  SetTaskTypeRequest,
  UpdateMeetingDataRequest,
  UpdateActualValueRequest,
  AgendaFilterOptions,
} from "../domain/interfaces/AgendaService.interface";

export class AgendaService {
  constructor(
    private agendaRepository: AgendaRepository,
    private notificationService: NotificationService,
  ) {}

  async createAgendaItem(
    request: CreateAgendaItemRequest,
  ): Promise<AgendaItem> {
    const {
      projectId,
      boardId,
      taskId,
      date,
      time,
      durationMinutes,
      taskType,
      meetingData,
    } = request;

    const agendaItem = new AgendaItem({
      project_id: projectId,
      board_id: boardId,
      task_id: taskId,
      scheduled_date: date,
      scheduled_time: time,
      duration_minutes: durationMinutes,
      task_type: taskType,
      meeting_data: meetingData,
    });

    await this.agendaRepository.saveAgendaItem(agendaItem);
    await this.maybeScheduleNotification(agendaItem, taskId);
    return agendaItem;
  }

  async getAgendaForDate(date: string): Promise<DayAgenda> {
    logger.debug(`[AgendaService] Loading agenda for date: ${date}`);
    const items = await this.agendaRepository.loadAgendaItemsForDate(date);
    logger.debug(
      `[AgendaService] Found ${items.length} agenda items for ${date}`,
    );

    const scheduledItems = items.map((item) =>
      this.mapToScheduledAgendaItem(item),
    );

    const regularTasks = scheduledItems.filter(
      (si) => si.agendaItem.task_type === "regular",
    );
    const meetings = scheduledItems.filter(
      (si) => si.agendaItem.task_type === "meeting",
    );
    const milestones = scheduledItems.filter(
      (si) => si.agendaItem.task_type === "milestone",
    );

    return {
      date,
      items: scheduledItems,
      regularTasks,
      meetings,
      milestones,
      orphanedItems: scheduledItems.filter((si) => si.isOrphaned),
      tasks: regularTasks,
    };
  }

  private mapToScheduledAgendaItem(item: AgendaItem): ScheduledAgendaItem {
    const task = this.buildTaskFromAgendaItem(item);

    return {
      agendaItem: item,
      task,
      boardId: item.board_id,
      projectId: item.project_id,
      projectName: item.project_name || "",
      isOrphaned: !item.task_id,
      boardName: item.board_name || "",
      columnName: item.column_name || null,
    };
  }

  private buildTaskFromAgendaItem(item: AgendaItem): Task | null {
    if (!item.task_id) {
      return null;
    }

    return new Task({
      id: item.task_id,
      title: item.task_title || item.task_id,
      column_id: item.column_id || "",
      description: item.task_description || "",
      project_id: item.project_id,
      task_type: item.task_type,
      priority: item.task_priority || "none",
      goal_id: item.task_goal_id || null,
      meeting_data: item.meeting_data,
    });
  }

  async getAgendaForWeek(
    weekStartDate?: string,
  ): Promise<Map<string, DayAgenda>> {
    const start = weekStartDate
      ? new Date(weekStartDate)
      : this.getMonday(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return this.getAgendaForDateRange(
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0],
    );
  }

  async getAgendaForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Map<string, DayAgenda>> {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const dayAgendas = await Promise.all(
      dates.map((date) => this.getAgendaForDate(date)),
    );

    const result = new Map<string, DayAgenda>();
    dayAgendas.forEach((dayAgenda, index) => {
      result.set(dates[index], dayAgenda);
    });

    return result;
  }

  async getAllScheduledItems(): Promise<ScheduledAgendaItem[]> {
    const items = await this.agendaRepository.loadAllAgendaItems();
    return items.map((item) => this.mapToScheduledAgendaItem(item));
  }

  async getAgendaForToday(): Promise<DayAgenda> {
    const today = new Date().toISOString().split("T")[0];
    return this.getAgendaForDate(today);
  }

  async updateAgendaItem(request: UpdateAgendaItemRequest): Promise<void> {
    const { id, updates } = request;

    const existing = await this.agendaRepository.loadAgendaItemById(id);
    if (!existing) {
      throw new Error("Agenda item not found");
    }

    const wasCompleted = !!existing.completed_at;
    const willBeCompleted = updates.completed_at !== null;

    if (!wasCompleted && willBeCompleted) {
      await this.agendaRepository.completeAgendaItem(
        id,
        updates.completed_at ? new Date(updates.completed_at) : undefined,
        updates.notes,
      );

      if (existing.notification_id) {
        await this.notificationService.cancelNotification(
          existing.notification_id,
        );
      }
      return;
    }

    if (updates.completed_at && existing.notification_id) {
      await this.notificationService.cancelNotification(
        existing.notification_id,
      );
    }

    existing.update(updates);
    await this.agendaRepository.saveAgendaItem(existing);
  }

  async deleteAgendaItem(item: AgendaItem): Promise<boolean> {
    if (item.notification_id) {
      await this.notificationService.cancelNotification(item.notification_id);
    }
    return await this.agendaRepository.deleteAgendaItem(item);
  }

  async rescheduleAgendaItem(
    request: RescheduleAgendaItemRequest,
  ): Promise<AgendaItem> {
    const { item, newDate, newTime } = request;

    if (item.notification_id) {
      await this.notificationService.cancelNotification(item.notification_id);
    }

    const startAt = newTime ? new Date(`${newDate}T${newTime}`) : null;
    const rescheduledItem = await this.agendaRepository.rescheduleAgendaItem(
      item.id,
      newDate,
      startAt,
      item.duration_minutes,
    );

    await this.maybeScheduleNotification(
      rescheduledItem,
      rescheduledItem.task_id,
    );
    return rescheduledItem;
  }

  async getOrphanedAgendaItems(): Promise<ScheduledAgendaItem[]> {
    const orphanedItems = await this.agendaRepository.getOrphanedAgendaItems();
    return orphanedItems.map((item) => this.mapToScheduledAgendaItem(item));
  }

  async cleanupOrphanedItems(): Promise<number> {
    const orphaned = await this.agendaRepository.getOrphanedAgendaItems();
    let deletedCount = 0;

    for (const item of orphaned) {
      const success = await this.agendaRepository.deleteAgendaItem(item);
      if (success) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async getUpcomingAgendaItems(
    days: number = 7,
  ): Promise<ScheduledAgendaItem[]> {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + days);

    const todayStr = today.toISOString().split("T")[0];
    const futureStr = future.toISOString().split("T")[0];

    const items = await this.agendaRepository.loadAgendaItemsForDateRange(
      todayStr,
      futureStr,
    );
    return await this.resolveAgendaItems(items);
  }

  async getOverdueAgendaItems(): Promise<ScheduledAgendaItem[]> {
    const today = new Date().toISOString().split("T")[0];
    const allItems = await this.agendaRepository.loadAllAgendaItems();

    const overdueItems = allItems.filter((item) => {
      return item.scheduled_date < today;
    });

    const scheduled = await this.resolveAgendaItems(overdueItems);

    return scheduled.filter((si) => {
      if (si.isOrphaned) return false;
      if (!si.task) return false;
      const normalizedColumnId = si.task.column_id.replace(/_/g, "-");
      return normalizedColumnId !== "done";
    });
  }

  async scheduleTask(request: ScheduleTaskRequest): Promise<AgendaItem> {
    throw new Error(
      "scheduleTask: This method needs to be refactored to use backend endpoints. Use createAgendaItem instead.",
    );
  }

  async setTaskType(request: SetTaskTypeRequest): Promise<void> {
    throw new Error(
      "setTaskType: This method needs to be refactored to use backend endpoints.",
    );
  }

  async unscheduleTask(boardId: BoardId, taskId: TaskId): Promise<void> {
    throw new Error(
      "unscheduleTask: This method needs to be refactored to use backend endpoints.",
    );
  }

  async getTasksForDate(date: string): Promise<DayAgenda> {
    return this.getAgendaForDate(date);
  }

  async updateMeetingData(request: UpdateMeetingDataRequest): Promise<void> {
    throw new Error(
      "updateMeetingData: This method needs to be refactored to use backend endpoints.",
    );
  }

  async getAgendaItemById(id: string): Promise<AgendaItem | null> {
    return this.agendaRepository.loadAgendaItemById(id);
  }

  async getAgendaItemsByTask(
    projectId: ProjectId,
    boardId: BoardId,
    taskId: TaskId,
  ): Promise<AgendaItem[]> {
    return this.agendaRepository.loadAgendaItemsByTask(
      projectId,
      boardId,
      taskId,
    );
  }

  async getTaskFromBoard(
    boardId: BoardId,
    taskId: TaskId,
  ): Promise<{ task: Task | null; projectId: ProjectId | null }> {
    const board = await this.boardService.getBoardById(boardId);
    if (!board) {
      return { task: null, projectId: null };
    }

    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        return { task, projectId: board.project_id };
      }
    }

    return { task: null, projectId: null };
  }

  async getAgendaForDateFiltered(
    date: string,
    filters?: AgendaFilterOptions,
  ): Promise<DayAgenda> {
    const dayAgenda = await this.getAgendaForDate(date);

    if (!filters?.projectId && !filters?.goalId) {
      return dayAgenda;
    }

    const filterItems = (items: ScheduledAgendaItem[]) => {
      return items.filter((item) => {
        if (
          filters?.projectId &&
          item.agendaItem.project_id !== filters.projectId
        ) {
          return false;
        }
        if (filters?.goalId && item.task?.goal_id !== filters.goalId) {
          return false;
        }
        return true;
      });
    };

    const filtered = filterItems(dayAgenda.items);

    return {
      date,
      items: filtered,
      regularTasks: filtered.filter(
        (si) => si.agendaItem.task_type === "regular",
      ),
      meetings: filtered.filter((si) => si.agendaItem.task_type === "meeting"),
      milestones: filtered.filter(
        (si) => si.agendaItem.task_type === "milestone",
      ),
      orphanedItems: filtered.filter((si) => si.isOrphaned),
      tasks: filtered.filter((si) => si.agendaItem.task_type === "regular"),
    };
  }

  async getUnfinishedItems(date?: string): Promise<ScheduledAgendaItem[]> {
    const unfinished = await this.agendaRepository.loadUnfinishedItems(date);
    return await this.resolveAgendaItems(unfinished);
  }

  async markAsUnfinished(agendaItemId: string): Promise<void> {
    const item = await this.agendaRepository.loadAgendaItemById(agendaItemId);
    if (!item) {
      throw new Error("Agenda item not found");
    }

    item.markAsUnfinished();
    await this.agendaRepository.saveAgendaItem(item);
  }

  async updateActualValue(request: UpdateActualValueRequest): Promise<void> {
    const { agendaItemId, value } = request;

    const item = await this.agendaRepository.loadAgendaItemById(agendaItemId);
    if (!item) {
      throw new Error("Agenda item not found");
    }

    item.updateActualValue(value);
    await this.agendaRepository.saveAgendaItem(item);
  }

  async getAllSchedulableTasks(
    projectId?: ProjectId,
    goalId?: string,
  ): Promise<ScheduledTask[]> {
    throw new Error(
      "getAllSchedulableTasks: This method needs to be refactored to use backend endpoints.",
    );
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private async maybeScheduleNotification(
    item: AgendaItem,
    title?: string,
  ): Promise<void> {
    if (!item.scheduled_time) {
      return;
    }

    const triggerTime = new Date(
      `${item.scheduled_date}T${item.scheduled_time}`,
    );
    if (triggerTime.getTime() <= Date.now()) {
      return;
    }

    const handle = await this.notificationService.scheduleNotification(
      {
        title: "Goal Reminder",
        message: title || item.task_id,
        data: { agendaItemId: item.id },
      },
      triggerTime,
    );

    if (handle) {
      item.notification_id = handle.id;
      await this.agendaRepository.saveAgendaItem(item);
    }
  }

  private async resolveAgendaItems(
    items: AgendaItem[],
  ): Promise<ScheduledAgendaItem[]> {
    return items.map((item) => this.mapToScheduledAgendaItem(item));
  }
}
