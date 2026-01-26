import { Routine } from '@prisma/client';
import { RoutineCreateData } from '../data/routine.create.data';
import { RoutineUpdateData } from '../data/routine.update.data';

export const ROUTINE_REPOSITORY = 'ROUTINE_REPOSITORY';

export interface RoutineRepository {
  findAll(): Promise<Routine[]>;
  findById(id: string): Promise<Routine | null>;
  create(data: RoutineCreateData): Promise<Routine>;
  update(id: string, data: RoutineUpdateData): Promise<Routine>;
  delete(id: string): Promise<void>;
}
