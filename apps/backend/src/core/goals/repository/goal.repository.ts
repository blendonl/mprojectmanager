import { Goal } from '@prisma/client';
import { GoalCreateData } from '../data/goal.create.data';
import { GoalUpdateData } from '../data/goal.update.data';

export const GOAL_REPOSITORY = 'GOAL_REPOSITORY';

export interface GoalRepository {
  create(data: GoalCreateData): Promise<Goal>;
  findAll(): Promise<Goal[]>;
  findById(id: number): Promise<Goal | null>;
  update(id: number, data: GoalUpdateData): Promise<Goal>;
  delete(id: number): Promise<void>;
}
