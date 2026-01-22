import { useMemo } from "react";
import { container } from "tsyringe";

import {
  BOARD_REPOSITORY,
  COLUMN_REPOSITORY,
  TASK_REPOSITORY,
  PROJECT_REPOSITORY,
  AGENDA_REPOSITORY,
  MARKDOWN_AGENDA_REPOSITORY,
  NOTE_REPOSITORY,
  GOAL_REPOSITORY,
  TIME_LOG_REPOSITORY,
  CALENDAR_REPOSITORY,
  STORAGE_REPOSITORY,
  BOARD_SERVICE,
  PROJECT_SERVICE,
  AGENDA_SERVICE,
  NOTE_SERVICE,
  TASK_SERVICE,
  GOAL_SERVICE,
  VALIDATION_SERVICE,
  TIME_TRACKING_SERVICE,
  CALENDAR_SYNC_SERVICE,
  NOTIFICATION_SERVICE,
  UNFINISHED_TASKS_SERVICE,
  FILE_SYSTEM_MANAGER,
  STORAGE_CONFIG,
  ACTIONS_CONFIG,
  BACKEND_API_CLIENT,
  DAEMON_RUNNER,
  WEBSOCKET_MANAGER,
} from "./tokens";

import type { BoardRepository } from "@features/boards/domain/repositories/BoardRepository";
import type { ColumnRepository } from "@features/boards/domain/repositories/ColumnRepository";
import type { TaskRepository } from "@features/boards/domain/repositories/TaskRepository";
import type { ProjectRepository } from "@features/projects/domain/repositories/ProjectRepository";
import type { AgendaRepository } from "@features/agenda/domain/repositories/AgendaRepository";
import type { NoteRepository } from "@features/notes/domain/repositories/NoteRepository";
import type { GoalRepository } from "@features/goals/domain/repositories/GoalRepository";
import type { TimeLogRepository } from "@features/time/domain/repositories/TimeLogRepository";
import type { CalendarRepository } from "@domain/repositories/CalendarRepository";
import type { StorageRepository } from "@domain/repositories/StorageRepository";

import type { BoardService } from "@features/boards/services/BoardService";
import type { ProjectService } from "@features/projects/services/ProjectService";
import type { AgendaService } from "@features/agenda/services/AgendaService";
import type { NoteService } from "@features/notes/services/NoteService";
import type { TaskService } from "@features/boards/services/TaskService";
import type { GoalService } from "@features/goals/services/GoalService";
import type { ValidationService } from "@services/ValidationService";
import type { TimeTrackingService } from "@features/time/services/TimeTrackingService";
import type { CalendarSyncService } from "@services/CalendarSyncService";
import type { NotificationService } from "@services/NotificationService";
import type { UnfinishedTasksService } from "@features/agenda/services/UnfinishedTasksService";

import type { FileSystemManager } from "@infrastructure/storage/FileSystemManager";
import type { StorageConfig } from "@core/StorageConfig";
import type { ActionsConfig } from "@core/ActionsConfig";
import type { BackendApiClient } from "../../infrastructure/api/BackendApiClient";
import type { DaemonRunner } from "../../infrastructure/daemon/DaemonRunner";
import type { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager";

export function useBoardRepository(): BoardRepository {
  return useMemo(
    () => container.resolve<BoardRepository>(BOARD_REPOSITORY),
    []
  );
}

export function useColumnRepository(): ColumnRepository {
  return useMemo(
    () => container.resolve<ColumnRepository>(COLUMN_REPOSITORY),
    []
  );
}

export function useTaskRepository(): TaskRepository {
  return useMemo(
    () => container.resolve<TaskRepository>(TASK_REPOSITORY),
    []
  );
}

export function useProjectRepository(): ProjectRepository {
  return useMemo(
    () => container.resolve<ProjectRepository>(PROJECT_REPOSITORY),
    []
  );
}

export function useAgendaRepository(): AgendaRepository {
  return useMemo(
    () => container.resolve<AgendaRepository>(AGENDA_REPOSITORY),
    []
  );
}

export function useMarkdownAgendaRepository(): AgendaRepository {
  return useMemo(
    () => container.resolve<AgendaRepository>(MARKDOWN_AGENDA_REPOSITORY),
    []
  );
}

export function useNoteRepository(): NoteRepository {
  return useMemo(
    () => container.resolve<NoteRepository>(NOTE_REPOSITORY),
    []
  );
}

export function useGoalRepository(): GoalRepository {
  return useMemo(
    () => container.resolve<GoalRepository>(GOAL_REPOSITORY),
    []
  );
}

export function useTimeLogRepository(): TimeLogRepository {
  return useMemo(
    () => container.resolve<TimeLogRepository>(TIME_LOG_REPOSITORY),
    []
  );
}

export function useCalendarRepository(): CalendarRepository {
  return useMemo(
    () => container.resolve<CalendarRepository>(CALENDAR_REPOSITORY),
    []
  );
}

export function useStorageRepository(): StorageRepository {
  return useMemo(
    () => container.resolve<StorageRepository>(STORAGE_REPOSITORY),
    []
  );
}

export function useBoardService(): BoardService {
  return useMemo(() => container.resolve<BoardService>(BOARD_SERVICE), []);
}

export function useProjectService(): ProjectService {
  return useMemo(() => container.resolve<ProjectService>(PROJECT_SERVICE), []);
}

export function useAgendaService(): AgendaService {
  return useMemo(() => container.resolve<AgendaService>(AGENDA_SERVICE), []);
}

export function useNoteService(): NoteService {
  return useMemo(() => container.resolve<NoteService>(NOTE_SERVICE), []);
}

export function useTaskService(): TaskService {
  return useMemo(() => container.resolve<TaskService>(TASK_SERVICE), []);
}

export function useGoalService(): GoalService {
  return useMemo(() => container.resolve<GoalService>(GOAL_SERVICE), []);
}

export function useValidationService(): ValidationService {
  return useMemo(
    () => container.resolve<ValidationService>(VALIDATION_SERVICE),
    []
  );
}

export function useTimeTrackingService(): TimeTrackingService {
  return useMemo(
    () => container.resolve<TimeTrackingService>(TIME_TRACKING_SERVICE),
    []
  );
}

export function useCalendarSyncService(): CalendarSyncService {
  return useMemo(
    () => container.resolve<CalendarSyncService>(CALENDAR_SYNC_SERVICE),
    []
  );
}

export function useNotificationService(): NotificationService {
  return useMemo(
    () => container.resolve<NotificationService>(NOTIFICATION_SERVICE),
    []
  );
}

export function useUnfinishedTasksService(): UnfinishedTasksService {
  return useMemo(
    () => container.resolve<UnfinishedTasksService>(UNFINISHED_TASKS_SERVICE),
    []
  );
}

export function useFileSystemManager(): FileSystemManager {
  return useMemo(
    () => container.resolve<FileSystemManager>(FILE_SYSTEM_MANAGER),
    []
  );
}

export function useStorageConfig(): StorageConfig {
  return useMemo(() => container.resolve<StorageConfig>(STORAGE_CONFIG), []);
}

export function useActionsConfig(): ActionsConfig {
  return useMemo(() => container.resolve<ActionsConfig>(ACTIONS_CONFIG), []);
}

export function useBackendApiClient(): BackendApiClient {
  return useMemo(
    () => container.resolve<BackendApiClient>(BACKEND_API_CLIENT),
    []
  );
}

export function useDaemonRunner(): DaemonRunner {
  return useMemo(() => container.resolve<DaemonRunner>(DAEMON_RUNNER), []);
}

export function useWebSocketManager(): WebSocketManager {
  return useMemo(
    () => container.resolve<WebSocketManager>(WEBSOCKET_MANAGER),
    []
  );
}

export function getBoardService(): BoardService {
  return container.resolve<BoardService>(BOARD_SERVICE);
}

export function getProjectService(): ProjectService {
  return container.resolve<ProjectService>(PROJECT_SERVICE);
}

export function getAgendaService(): AgendaService {
  return container.resolve<AgendaService>(AGENDA_SERVICE);
}

export function getNoteService(): NoteService {
  return container.resolve<NoteService>(NOTE_SERVICE);
}

export function getTaskService(): TaskService {
  return container.resolve<TaskService>(TASK_SERVICE);
}

export function getGoalService(): GoalService {
  return container.resolve<GoalService>(GOAL_SERVICE);
}

export function getValidationService(): ValidationService {
  return container.resolve<ValidationService>(VALIDATION_SERVICE);
}

export function getTimeTrackingService(): TimeTrackingService {
  return container.resolve<TimeTrackingService>(TIME_TRACKING_SERVICE);
}

export function getCalendarSyncService(): CalendarSyncService {
  return container.resolve<CalendarSyncService>(CALENDAR_SYNC_SERVICE);
}

export function getNotificationService(): NotificationService {
  return container.resolve<NotificationService>(NOTIFICATION_SERVICE);
}

export function getUnfinishedTasksService(): UnfinishedTasksService {
  return container.resolve<UnfinishedTasksService>(UNFINISHED_TASKS_SERVICE);
}

export function getFileSystemManager(): FileSystemManager {
  return container.resolve<FileSystemManager>(FILE_SYSTEM_MANAGER);
}

export function getStorageConfig(): StorageConfig {
  return container.resolve<StorageConfig>(STORAGE_CONFIG);
}

export function getActionsConfig(): ActionsConfig {
  return container.resolve<ActionsConfig>(ACTIONS_CONFIG);
}

export function getBackendApiClient(): BackendApiClient {
  return container.resolve<BackendApiClient>(BACKEND_API_CLIENT);
}

export function getDaemonRunner(): DaemonRunner {
  return container.resolve<DaemonRunner>(DAEMON_RUNNER);
}

export function getWebSocketManager(): WebSocketManager {
  return container.resolve<WebSocketManager>(WEBSOCKET_MANAGER);
}

export function getBoardRepository(): BoardRepository {
  return container.resolve<BoardRepository>(BOARD_REPOSITORY);
}

export function getColumnRepository(): ColumnRepository {
  return container.resolve<ColumnRepository>(COLUMN_REPOSITORY);
}

export function getTaskRepository(): TaskRepository {
  return container.resolve<TaskRepository>(TASK_REPOSITORY);
}

export function getProjectRepository(): ProjectRepository {
  return container.resolve<ProjectRepository>(PROJECT_REPOSITORY);
}

export function getAgendaRepository(): AgendaRepository {
  return container.resolve<AgendaRepository>(AGENDA_REPOSITORY);
}

export function getMarkdownAgendaRepository(): AgendaRepository {
  return container.resolve<AgendaRepository>(MARKDOWN_AGENDA_REPOSITORY);
}

export function getNoteRepository(): NoteRepository {
  return container.resolve<NoteRepository>(NOTE_REPOSITORY);
}

export function getGoalRepository(): GoalRepository {
  return container.resolve<GoalRepository>(GOAL_REPOSITORY);
}

export function getTimeLogRepository(): TimeLogRepository {
  return container.resolve<TimeLogRepository>(TIME_LOG_REPOSITORY);
}

export function getCalendarRepository(): CalendarRepository {
  return container.resolve<CalendarRepository>(CALENDAR_REPOSITORY);
}

export function getStorageRepository(): StorageRepository {
  return container.resolve<StorageRepository>(STORAGE_REPOSITORY);
}
