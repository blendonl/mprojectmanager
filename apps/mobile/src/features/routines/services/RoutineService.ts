import { injectable, inject } from "tsyringe";
import { Routine, RoutineId, RoutineProps, RoutineType } from "../domain/entities/Routine";
import { RoutineRepository } from "../domain/repositories/RoutineRepository";
import { validateRoutineTarget } from "../domain/utils/routineValidation";
import { getEventBus } from "@core/EventBus";
import { ROUTINE_REPOSITORY } from "@core/di/tokens";

export class RoutineNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutineNotFoundError";
  }
}

@injectable()
export class RoutineService {
  constructor(@inject(ROUTINE_REPOSITORY) private readonly repository: RoutineRepository) {}

  private validateRoutineName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Routine name cannot be empty");
    }

    if (name.length > 100) {
      throw new Error("Routine name must be 100 characters or less");
    }
  }

  async getRoutines(): Promise<Routine[]> {
    return await this.repository.loadRoutines();
  }

  async getRoutineById(id: RoutineId): Promise<Routine> {
    const routine = await this.repository.loadRoutineById(id);

    if (!routine) {
      throw new RoutineNotFoundError(`Routine with id '${id}' not found`);
    }

    return routine;
  }

  async createRoutine(
    name: string,
    type: RoutineType,
    target: string,
    options?: {
      separateInto?: number;
      repeatIntervalMinutes?: number;
      activeDays?: string[];
    },
  ): Promise<Routine> {
    this.validateRoutineName(name);

    const validation = validateRoutineTarget(type, target);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid routine target");
    }

    const routine = await this.repository.createRoutine(
      name,
      type,
      target,
      options?.separateInto,
      options?.repeatIntervalMinutes,
      options?.activeDays,
    );

    await getEventBus().publish("routine_created", {
      routineId: routine.id,
      routineName: routine.name,
      routineType: routine.type,
      timestamp: new Date(),
    });

    await getEventBus().publish("agenda_invalidated", {
      entityType: "agenda",
      changeType: "modified",
      filePath: "routines",
      affectedIds: [routine.id],
      timestamp: new Date(),
    });

    return routine;
  }

  async updateRoutine(id: RoutineId, updates: Partial<RoutineProps>): Promise<Routine> {
    const routine = await this.getRoutineById(id);

    if (updates.name) {
      this.validateRoutineName(updates.name);
    }

    if (updates.target) {
      const validation = validateRoutineTarget(routine.type, updates.target);
      if (!validation.valid) {
        throw new Error(validation.error || "Invalid routine target");
      }
    }

    const updatedRoutine = await this.repository.updateRoutine(id, updates);

    await getEventBus().publish("routine_updated", {
      routineId: updatedRoutine.id,
      routineName: updatedRoutine.name,
      routineType: updatedRoutine.type,
      timestamp: new Date(),
    });

    return updatedRoutine;
  }

  async deleteRoutine(id: RoutineId): Promise<boolean> {
    const routine = await this.getRoutineById(id);
    const deleted = await this.repository.deleteRoutine(id);

    if (deleted) {
      await getEventBus().publish("routine_deleted", {
        routineId: routine.id,
        routineName: routine.name,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  async disableRoutine(id: RoutineId): Promise<Routine> {
    const routine = await this.getRoutineById(id);
    routine.disable();

    const updatedRoutine = await this.repository.updateRoutine(id, { status: "DISABLED" });

    await getEventBus().publish("routine_disabled", {
      routineId: updatedRoutine.id,
      routineName: updatedRoutine.name,
      timestamp: new Date(),
    });

    return updatedRoutine;
  }

  async enableRoutine(id: RoutineId): Promise<Routine> {
    const routine = await this.getRoutineById(id);
    routine.activate();

    const updatedRoutine = await this.repository.updateRoutine(id, { status: "ACTIVE" });

    await getEventBus().publish("routine_enabled", {
      routineId: updatedRoutine.id,
      routineName: updatedRoutine.name,
      timestamp: new Date(),
    });

    return updatedRoutine;
  }

  async logTaskExecution(
    routineTaskId: string,
    userId: string,
    value?: string,
  ): Promise<void> {
    await this.repository.logTaskExecution(routineTaskId, userId, value);

    await getEventBus().publish("routine_task_logged", {
      routineTaskId,
      userId,
      timestamp: new Date(),
    });
  }
}
