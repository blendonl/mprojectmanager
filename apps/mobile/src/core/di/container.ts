import "reflect-metadata";
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

import { FileSystemManager } from "@infrastructure/storage/FileSystemManager";
import { StorageConfig } from "@core/StorageConfig";
import { ActionsConfig } from "@core/ActionsConfig";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";

import { BackendBoardRepository } from "@features/boards/infrastructure/BackendBoardRepository";
import { BackendColumnRepository } from "@features/boards/infrastructure/BackendColumnRepository";
import { BackendTaskRepository } from "@features/boards/infrastructure/BackendTaskRepository";
import { BackendProjectRepository } from "@features/projects/infrastructure/BackendProjectRepository";
import { BackendAgendaRepository } from "@features/agenda/infrastructure/BackendAgendaRepository";

import { MarkdownBoardRepository } from "@features/boards/infrastructure/MarkdownBoardRepository";
import { MarkdownStorageRepository } from "@infrastructure/storage/MarkdownStorageRepository";
import { MarkdownNoteRepository } from "@features/notes/infrastructure/MarkdownNoteRepository";
import { MarkdownAgendaRepository } from "@features/agenda/infrastructure/MarkdownAgendaRepository";
import { MarkdownGoalRepository } from "@features/goals/infrastructure/MarkdownGoalRepository";
import { YamlTimeLogRepository } from "@features/time/infrastructure/YamlTimeLogRepository";
import { GoogleCalendarRepository } from "@infrastructure/calendar/GoogleCalendarRepository";

import { ValidationService } from "@services/ValidationService";
import { BoardService } from "@features/boards/services/BoardService";
import { CachedBoardService } from "@features/boards/services/CachedBoardService";
import { TaskService } from "@features/boards/services/TaskService";
import { ProjectService } from "@features/projects/services/ProjectService";
import { CachedProjectService } from "@features/projects/services/CachedProjectService";
import { AgendaService } from "@features/agenda/services/AgendaService";
import { CachedAgendaService } from "@features/agenda/services/CachedAgendaService";
import { NoteService } from "@features/notes/services/NoteService";
import { CachedNoteService } from "@features/notes/services/CachedNoteService";
import { GoalService } from "@features/goals/services/GoalService";
import { TimeTrackingService } from "@features/time/services/TimeTrackingService";
import { CalendarSyncService } from "@services/CalendarSyncService";
import { NotificationService } from "@services/NotificationService";
import { UnfinishedTasksService } from "@features/agenda/services/UnfinishedTasksService";

import { DaemonRunner } from "@infrastructure/daemon/DaemonRunner";
import { WebSocketManager } from "@infrastructure/websocket/WebSocketManager";
import { BackendChangeDetector } from "@infrastructure/daemon/BackendChangeDetector";
import { EntityChangeWatcherTask } from "@infrastructure/daemon/tasks";

let isInitialized = false;

export type InitializationProgressCallback = (step: string) => void;

let progressCallback: InitializationProgressCallback | null = null;

export function setInitializationProgressCallback(
  callback: InitializationProgressCallback | null
): void {
  progressCallback = callback;
}

export async function initializeContainer(
  useBackend: boolean = true
): Promise<void> {
  if (isInitialized) {
    console.log("[DI Container] Already initialized");
    return;
  }

  progressCallback?.("Starting initialization...");
  console.log("[DI Container] Starting initialization...");

  progressCallback?.("Registering core infrastructure...");
  container.registerSingleton(FILE_SYSTEM_MANAGER, FileSystemManager);
  container.registerSingleton(STORAGE_CONFIG, StorageConfig);
  container.registerSingleton(ACTIONS_CONFIG, ActionsConfig);
  container.registerSingleton(BACKEND_API_CLIENT, BackendApiClient);
  container.registerSingleton(WEBSOCKET_MANAGER, WebSocketManager);

  progressCallback?.("Initializing file system...");
  console.log("[DI Container] Initializing FileSystemManager...");
  const fileSystemManager =
    container.resolve<FileSystemManager>(FILE_SYSTEM_MANAGER);
  await fileSystemManager.initialize();
  console.log("[DI Container] FileSystemManager initialized");

  progressCallback?.("Loading storage configuration...");
  console.log("[DI Container] Loading storage config...");
  const storageConfig = container.resolve<StorageConfig>(STORAGE_CONFIG);
  const boardsDir = await storageConfig.getBoardsDirectory();
  const defaultDir = storageConfig.getDefaultBoardsDirectory();
  if (boardsDir !== defaultDir) {
    console.log("Custom boards directory loaded:", boardsDir);
  }
  console.log("[DI Container] Storage config loaded");

  progressCallback?.("Loading actions configuration...");
  console.log("[DI Container] Loading actions config...");
  const actionsConfig = container.resolve<ActionsConfig>(ACTIONS_CONFIG);
  await actionsConfig.initialize();
  console.log("[DI Container] Actions config loaded");

  progressCallback?.("Registering repositories...");
  if (useBackend) {
    container.registerSingleton(BOARD_REPOSITORY, BackendBoardRepository);
    container.registerSingleton(COLUMN_REPOSITORY, BackendColumnRepository);
    container.registerSingleton(TASK_REPOSITORY, BackendTaskRepository);
    container.registerSingleton(PROJECT_REPOSITORY, BackendProjectRepository);
    container.registerSingleton(AGENDA_REPOSITORY, BackendAgendaRepository);
  } else {
    container.registerSingleton(BOARD_REPOSITORY, MarkdownBoardRepository);
    container.registerSingleton(AGENDA_REPOSITORY, MarkdownAgendaRepository);
  }

  container.registerSingleton(
    MARKDOWN_AGENDA_REPOSITORY,
    MarkdownAgendaRepository
  );
  container.registerSingleton(NOTE_REPOSITORY, MarkdownNoteRepository);
  container.registerSingleton(GOAL_REPOSITORY, MarkdownGoalRepository);
  container.registerSingleton(TIME_LOG_REPOSITORY, YamlTimeLogRepository);
  container.registerSingleton(CALENDAR_REPOSITORY, GoogleCalendarRepository);
  container.registerSingleton(STORAGE_REPOSITORY, MarkdownStorageRepository);

  progressCallback?.("Registering services...");
  container.registerSingleton(VALIDATION_SERVICE, ValidationService);

  container.register(BOARD_SERVICE, {
    useFactory: (c) => {
      const baseService = c.resolve(BoardService);
      return new CachedBoardService(baseService);
    },
  });

  container.register(TASK_SERVICE, {
    useFactory: (c) => {
      return new TaskService(
        c.resolve(TASK_REPOSITORY),
        c.resolve(VALIDATION_SERVICE)
      );
    },
  });

  container.register(PROJECT_SERVICE, {
    useFactory: (c) => {
      const baseService = new ProjectService(
        c.resolve(PROJECT_REPOSITORY),
        c.resolve(VALIDATION_SERVICE)
      );
      return new CachedProjectService(baseService);
    },
  });

  container.register(NOTIFICATION_SERVICE, {
    useFactory: (c) => {
      const service = new NotificationService(c.resolve(ACTIONS_CONFIG));
      service.initialize().catch((error) => {
        console.error("Failed to initialize NotificationService:", error);
      });
      return service;
    },
  });

  container.register(AGENDA_SERVICE, {
    useFactory: (c) => {
      const baseService = new AgendaService(
        c.resolve(AGENDA_REPOSITORY),
        c.resolve(NOTIFICATION_SERVICE)
      );
      return new CachedAgendaService(baseService);
    },
  });

  container.register(NOTE_SERVICE, {
    useFactory: (c) => {
      const baseService = new NoteService(
        c.resolve(NOTE_REPOSITORY),
        c.resolve(VALIDATION_SERVICE)
      );
      return new CachedNoteService(baseService);
    },
  });

  container.register(GOAL_SERVICE, {
    useFactory: (c) => {
      return new GoalService(
        c.resolve(GOAL_REPOSITORY),
        c.resolve(BOARD_SERVICE),
        c.resolve(MARKDOWN_AGENDA_REPOSITORY)
      );
    },
  });

  container.register(TIME_TRACKING_SERVICE, {
    useFactory: (c) => {
      return new TimeTrackingService(c.resolve(TIME_LOG_REPOSITORY));
    },
  });

  container.register(CALENDAR_SYNC_SERVICE, {
    useFactory: (c) => {
      return new CalendarSyncService(
        c.resolve(CALENDAR_REPOSITORY),
        c.resolve(BOARD_REPOSITORY)
      );
    },
  });

  container.register(UNFINISHED_TASKS_SERVICE, {
    useFactory: (c) => {
      return new UnfinishedTasksService(c.resolve(MARKDOWN_AGENDA_REPOSITORY));
    },
  });

  container.register(DAEMON_RUNNER, {
    useFactory: () => {
      const runner = new DaemonRunner();
      const entityChangeWatcherTask = new EntityChangeWatcherTask(
        new BackendChangeDetector({ entityTypes: ["agenda"] }),
        { entityTypes: ["agenda"] }
      );
      runner.registerTask(entityChangeWatcherTask);
      return runner;
    },
  });

  progressCallback?.("Starting daemon runner...");
  console.log("[DI Container] Starting DaemonRunner...");
  const daemonRunner = container.resolve<DaemonRunner>(DAEMON_RUNNER);
  try {
    await daemonRunner.start();
    console.log("[DI Container] DaemonRunner started");
  } catch (error) {
    console.error("[DI Container] DaemonRunner failed to start:", error);
  }

  progressCallback?.("Starting unfinished tasks service...");
  console.log("[DI Container] Starting UnfinishedTasksService...");
  const unfinishedTasksService = container.resolve<UnfinishedTasksService>(
    UNFINISHED_TASKS_SERVICE
  );
  unfinishedTasksService.start();
  console.log("[DI Container] UnfinishedTasksService started");

  isInitialized = true;
  progressCallback?.("Initialization complete");
  console.log("[DI Container] Initialization complete");
}

export function isContainerInitialized(): boolean {
  return isInitialized;
}

export function resetContainer(): void {
  container.clearInstances();
  isInitialized = false;
}

export function getContainer() {
  return container;
}

export { container };
