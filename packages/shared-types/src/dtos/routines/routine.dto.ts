import { EntityTimestamps } from '../../types/common.types';

export type RoutineType = 'SLEEP' | 'STEP' | 'OTHER';
export type RoutineStatus = 'ACTIVE' | 'DISABLED';

/**
 * Routine DTO
 */
export interface RoutineDto extends EntityTimestamps {
  id: string;
  name: string;
  description: string | null;
  type: RoutineType;
  target: string;
  separateInto: number;
  repeatIntervalMinutes: number;
  activeDays: string[] | null;
  status: RoutineStatus;
  isActive: boolean;
  color: string | null;
}

/**
 * Routine task DTO
 */
export interface RoutineTaskDto extends EntityTimestamps {
  id: string;
  routineId: string;
  name: string;
  description: string | null;
  target: string;
  duration: number | null;
  position: number | null;
}

/**
 * Routine with tasks
 */
export interface RoutineDetailDto extends RoutineDto {
  tasks: RoutineTaskDto[];
}

/**
 * Create routine request
 */
export interface RoutineCreateRequestDto {
  name: string;
  type: RoutineType;
  target: string;
  separateInto?: number;
  repeatIntervalMinutes: number;
  activeDays?: string[];
}

/**
 * Update routine request
 */
export interface RoutineUpdateRequestDto {
  name?: string;
  status?: RoutineStatus;
  type?: RoutineType;
  target?: string;
  separateInto?: number;
  repeatIntervalMinutes?: number;
  activeDays?: string[] | null;
}

/**
 * Create routine task request
 */
export interface RoutineTaskCreateRequestDto {
  routineId: string;
  name: string;
  description?: string;
  duration?: number;
  position?: number;
}

/**
 * Update routine task request
 */
export interface RoutineTaskUpdateRequestDto {
  name?: string;
  description?: string;
  duration?: number;
  position?: number;
}
