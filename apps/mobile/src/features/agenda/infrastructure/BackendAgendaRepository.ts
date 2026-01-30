import { injectable } from "tsyringe";
import { AgendaRepository } from "../domain/repositories/AgendaRepository";
import { AgendaItem } from "../domain/entities/AgendaItem";
import { DayAgenda, ScheduledAgendaItem } from "../domain/interfaces/AgendaService.interface";
import { logger } from "@utils/logger";
import { API_BASE_URL } from "@core/config/ApiConfig";
import { AgendaItemEnrichedDto, AgendaEnrichedDto } from "shared-types";

@injectable()
export class BackendAgendaRepository implements AgendaRepository {
  private baseUrl: string;
  private agendaBaseUrl: string;
  private itemsBaseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.agendaBaseUrl = `${this.baseUrl}/agendas`;
    this.itemsBaseUrl = `${this.baseUrl}/agenda-items`;
  }

  private async parseJson<T>(response: Response): Promise<T | null> {
    const text = await response.text();
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  }

  private async buildResponseError(
    response: Response,
    message: string,
  ): Promise<Error> {
    let responseText = "";
    try {
      responseText = await response.text();
    } catch {
      responseText = "";
    }

    const statusLabel = `${response.status} ${response.statusText}`.trim();
    const details = responseText ? `: ${responseText}` : "";
    return new Error(`${message} (${statusLabel})${details}`.trim());
  }

  private normalizeAgendaDate(dateValue: unknown, fallback: string): string {
    if (!dateValue) {
      return fallback;
    }

    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
      return dateValue.toISOString().split("T")[0];
    }

    if (typeof dateValue === "string") {
      const trimmed = dateValue.trim();
      if (!trimmed) {
        return fallback;
      }

      if (trimmed.includes("T")) {
        return trimmed.split("T")[0];
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    }

    return fallback;
  }

  async loadAgendaItemsForDate(date: string): Promise<DayAgenda | null> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/by-date/enriched?date=${date}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }

        console.log(response);

        throw new Error(`Failed to load agenda items for date: ${date}`);
      }
      const data = await this.parseJson<AgendaEnrichedDto>(response);
      if (!data) {
        return null;
      }
      return this.mapAgendaDtoToDayAgenda(data, date);
    } catch (error) {
      logger.error("Failed to load agenda items for date:", error);
      throw error;
    }
  }

  async loadAgendaItemsForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AgendaItem[]> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/date-range?start=${startDate}&end=${endDate}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }

        const error = await this.buildResponseError(
          response,
          `Failed to load agenda items for date range: ${startDate} - ${endDate}`,
        );
        throw error;
      }
      const agendas = (await this.parseJson<AgendaEnrichedDto[]>(response)) || [];
      return agendas.flatMap((agenda) => {
        const dayAgenda = this.mapAgendaDtoToDayAgenda(agenda, startDate);
        return this.flattenAgendaItems(dayAgenda);
      });
    } catch (error) {
      logger.error("Failed to load agenda items for date range:", error);
      throw error;
    }
  }

  async loadAgendasForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    try {
      type ScheduledItem = {
        agendaItem: AgendaItem;
        task: any;
        boardId: string;
        projectId: string;
        projectName: string;
        boardName: string;
        columnName: string | null;
        isOrphaned: boolean;
      };

      const response = await fetch(
        `${this.agendaBaseUrl}/date-range?start=${startDate}&end=${endDate}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }

        const error = await this.buildResponseError(
          response,
          `Failed to load agendas for date range: ${startDate} - ${endDate}`,
        );
        throw error;
      }
      const agendas = (await this.parseJson<AgendaEnrichedDto[]>(response)) || [];

      return agendas.map((agenda) =>
        this.mapAgendaDtoToDayAgenda(agenda, startDate),
      );
    } catch (error) {
      logger.error("Failed to load agendas for date range:", error);
      throw error;
    }
  }

  private buildTaskFromAgendaItem(item: AgendaItem): any {
    if (!item.taskId) {
      return null;
    }

    return {
      id: item.taskId,
      title: item.taskTitle || item.taskId,
      column_id: item.columnId || "",
      description: item.taskDescription || "",
      project_id: item.projectId,
      task_type: item.taskType,
      priority: item.taskPriority || "none",
      goal_id: item.taskGoalId || null,
      meeting_data: item.meetingData,
    };
  }

  private mapAgendaDtoToDayAgenda(
    agenda: AgendaEnrichedDto,
    fallbackDate: string,
  ): DayAgenda {
    const normalizedDate = this.normalizeAgendaDate(agenda.date, fallbackDate);
    const sleep = {
      sleep: agenda.sleep?.sleep
        ? this.mapEnrichedItemToScheduledItem(agenda.sleep.sleep)
        : null,
      wakeup: agenda.sleep?.wakeup
        ? this.mapEnrichedItemToScheduledItem(agenda.sleep.wakeup)
        : null,
    };
    const steps = (agenda.steps || []).map((item: AgendaItemEnrichedDto) =>
      this.mapEnrichedItemToScheduledItem(item),
    );
    const routines = (agenda.routines || []).map((item: AgendaItemEnrichedDto) =>
      this.mapEnrichedItemToScheduledItem(item),
    );
    const tasks = (agenda.tasks || []).map((item: AgendaItemEnrichedDto) =>
      this.mapEnrichedItemToScheduledItem(item),
    );
    const combined = [...steps, ...routines, ...tasks];

    return {
      date: normalizedDate,
      sleep,
      steps,
      routines,
      tasks,
      orphanedItems: combined.filter((item) => item.isOrphaned),
    };
  }

  private mapEnrichedItemToScheduledItem(
    enrichedItem: AgendaItemEnrichedDto,
  ): ScheduledAgendaItem {
    const agendaItem = this.mapEnrichedItemToAgendaItem(enrichedItem);
    return {
      agendaItem,
      task: this.buildTaskFromAgendaItem(agendaItem),
      boardId: agendaItem.boardId,
      projectName: agendaItem.projectName || "",
      boardName: agendaItem.boardName || "",
      columnName: agendaItem.columnName || null,
      isOrphaned: !agendaItem.taskId && !agendaItem.routineTaskId,
    };
  }

  private flattenAgendaItems(dayAgenda: DayAgenda): AgendaItem[] {
    const sleepItems = [dayAgenda.sleep.sleep, dayAgenda.sleep.wakeup].filter(
      (item): item is ScheduledAgendaItem => !!item,
    );
    return [
      ...sleepItems,
      ...dayAgenda.steps,
      ...dayAgenda.routines,
      ...dayAgenda.tasks,
    ].map((item) => item.agendaItem);
  }

  async loadAgendaItemById(agendaItemId: string): Promise<AgendaItem | null> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/${agendaItemId}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to load agenda item: ${agendaItemId}`);
      }
      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return null;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to load agenda item by id:", error);
      throw error;
    }
  }

  async loadAllAgendaItems(): Promise<AgendaItem[]> {
    try {
      const url = `${this.itemsBaseUrl}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to load all agenda items (${response.status}): ${errorText}`,
        );
      }
      const data = (await this.parseJson<AgendaItemEnrichedDto[]>(response)) || [];
      return data.map((item) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error(
        "Failed to load all agenda items:",
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }

  async createAgendaItem(request: any): Promise<AgendaItem> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/${request.agendaId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: request.taskId,
            type: request.type,
            status: request.status,
            startAt: request.startAt,
            duration: request.duration,
            position: request.position,
            notes: request.notes,
            notificationId: request.notificationId,
          }),
        },
      );

      if (!response.ok) {
        throw await this.buildResponseError(
          response,
          "Failed to create agenda item",
        );
      }

      const data = await this.parseJson<AgendaItemEnrichedDto>(response);
      if (!data) {
        throw new Error("No data returned from create agenda item");
      }

      return this.mapEnrichedItemToAgendaItem(data);
    } catch (error) {
      logger.error("Failed to create agenda item:", error);
      throw error;
    }
  }

  async saveAgendaItem(item: AgendaItem): Promise<void> {
    try {
      const method =
        item.id && item.id.startsWith("agenda-") && !item.id.includes("backend")
          ? "POST"
          : "PUT";
      const url =
        method === "POST"
          ? `${this.itemsBaseUrl}`
          : `${this.itemsBaseUrl}/${item.id}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item.toDict()),
      });

      if (!response.ok) {
        throw new Error(`Failed to save agenda item: ${item.id}`);
      }

      if (method === "POST") {
        const savedItem = await this.parseJson<Record<string, any>>(response);
        if (savedItem?.id) {
          item.id = savedItem.id;
        }
      }
    } catch (error) {
      logger.error("Failed to save agenda item:", error);
      throw error;
    }
  }

  async deleteAgendaItem(item: AgendaItem): Promise<boolean> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/${item.id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to delete agenda item: ${item.id}`);
      }

      return true;
    } catch (error) {
      logger.error("Failed to delete agenda item:", error);
      throw error;
    }
  }

  async getOrphanedAgendaItems(): Promise<AgendaItem[]> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/orphaned`);
      if (!response.ok) {
        throw new Error("Failed to load orphaned agenda items");
      }
      const data = (await this.parseJson<AgendaItemEnrichedDto[]>(response)) || [];
      return data.map((item) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load orphaned agenda items:", error);
      throw error;
    }
  }

  async getOverdueAgendaItems(): Promise<AgendaItem[]> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/overdue`);
      if (!response.ok) {
        throw new Error("Failed to load overdue agenda items");
      }
      const data = (await this.parseJson<AgendaItemEnrichedDto[]>(response)) || [];
      return data.map((item) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load overdue agenda items:", error);
      throw error;
    }
  }

  async getUpcomingAgendaItems(days: number = 7): Promise<AgendaItem[]> {
    try {
      const response = await fetch(
        `${this.itemsBaseUrl}/upcoming?days=${days}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load upcoming agenda items");
      }
      const data = (await this.parseJson<AgendaItemEnrichedDto[]>(response)) || [];
      return data.map((item) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load upcoming agenda items:", error);
      throw error;
    }
  }

  async loadUnfinishedItems(beforeDate?: string): Promise<AgendaItem[]> {
    try {
      const url = beforeDate
        ? `${this.itemsBaseUrl}/unfinished?beforeDate=${beforeDate}`
        : `${this.itemsBaseUrl}/unfinished`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load unfinished agenda items");
      }
      const data = (await this.parseJson<AgendaItemEnrichedDto[]>(response)) || [];
      return data.map((item) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load unfinished agenda items:", error);
      throw error;
    }
  }

  async searchAgendaItems(
    query: string,
    mode: "all" | "unfinished",
  ): Promise<any[]> {
    try {
      const url = `${this.itemsBaseUrl}/search?query=${encodeURIComponent(query)}&mode=${mode}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to search agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => {
        const agendaItem = this.mapEnrichedItemToAgendaItem(item);
        return {
          agendaItem,
          task: this.buildTaskFromAgendaItem(agendaItem),
          boardId: agendaItem.boardId,
          projectId: agendaItem.projectId,
          projectName: agendaItem.projectName || "",
          boardName: agendaItem.boardName || "",
          columnName: agendaItem.columnName || null,
          isOrphaned: !agendaItem.taskId && !agendaItem.routineTaskId,
        };
      });
    } catch (error) {
      logger.error("Failed to search agenda items:", error);
      throw error;
    }
  }

  async completeAgendaItem(
    itemId: string,
    completedAt?: Date,
    notes?: string,
  ): Promise<AgendaItem> {
    try {
      const item = await this.loadAgendaItemById(itemId);
      if (!item) {
        throw new Error(`Agenda item not found: ${itemId}`);
      }

      const response = await fetch(
        `${this.agendaBaseUrl}/${item.agendaId}/items/${itemId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completedAt: completedAt?.toISOString(),
            notes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to complete agenda item: ${itemId}`);
      }

      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return item;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to complete agenda item:", error);
      throw error;
    }
  }

  async rescheduleAgendaItem(
    itemId: string,
    newDate: string,
    startAt?: Date | null,
    duration?: number | null,
  ): Promise<AgendaItem> {
    try {
      const item = await this.loadAgendaItemById(itemId);
      if (!item) {
        throw new Error(`Agenda item not found: ${itemId}`);
      }

      const response = await fetch(
        `${this.agendaBaseUrl}/${item.agendaId}/items/${itemId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDate,
            startAt: startAt?.toISOString(),
            duration,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to reschedule agenda item: ${itemId}`);
      }

      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return item;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to reschedule agenda item:", error);
      throw error;
    }
  }

  private mapEnrichedItemToAgendaItem(enrichedItem: AgendaItemEnrichedDto): AgendaItem {
    const task = enrichedItem.task;
    const routineTask = enrichedItem.routineTask;
    const routineTaskId = routineTask?.id || enrichedItem.routineTaskId || null;
    const isRoutineTask = !!routineTaskId;

    const taskType = task?.taskType || routineTask?.routineType || 'regular';
    const taskPriority = task?.priority || null;

    return AgendaItem.fromDict({
      id: enrichedItem.id,
      agendaId: enrichedItem.agendaId,
      taskId: task?.id || enrichedItem.taskId,
      routineTaskId: routineTaskId,
      routineTaskName: routineTask?.name || null,
      routineName: routineTask?.routineName || null,
      routineType: routineTask?.routineType || null,
      routineTarget: routineTask?.routineTarget || null,
      projectId: task?.projectId || (isRoutineTask ? "routine" : ""),
      boardId: task?.boardId || (isRoutineTask ? "routine" : ""),
      columnId: task?.columnId || null,
      taskTitle: task?.title || routineTask?.name || "",
      taskDescription: task?.description || null,
      taskGoalId: task?.goalId || null,
      taskPriority: taskPriority,
      projectName: task?.projectName || (isRoutineTask ? "Routines" : ""),
      boardName: task?.boardName || (isRoutineTask ? "Routine" : ""),
      columnName: task?.columnName || null,
      scheduledDate: enrichedItem.startAt
        ? new Date(enrichedItem.startAt).toISOString().split("T")[0]
        : "",
      scheduledTime: enrichedItem.startAt
        ? new Date(enrichedItem.startAt).toTimeString().slice(0, 5)
        : undefined,
      durationMinutes: enrichedItem.duration ?? null,
      taskType: taskType,
      meetingData: task?.taskType === 'meeting' ? (enrichedItem as any).meeting_data : null,
      actualValue: null,
      status: enrichedItem.status,
      position: enrichedItem.position,
      notes: enrichedItem.notes,
      notificationId: enrichedItem.notificationId,
      isUnfinished: enrichedItem.status === "UNFINISHED",
      completedAt: enrichedItem.completedAt,
    });
  }
}
