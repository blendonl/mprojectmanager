import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { GoalUpdateData } from '../data/goal.update.data';
import {
  GOAL_REPOSITORY,
  type GoalRepository,
} from '../repository/goal.repository';

@Injectable()
export class GoalUpdateUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: number, data: GoalUpdateData): Promise<Goal> {
    const existingGoal = await this.goalRepository.findById(id);
    if (!existingGoal) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
    return this.goalRepository.update(id, data);
  }
}
