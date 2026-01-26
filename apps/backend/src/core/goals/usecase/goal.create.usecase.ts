import { Inject, Injectable } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { GoalCreateData } from '../data/goal.create.data';
import {
  GOAL_REPOSITORY,
  type GoalRepository,
} from '../repository/goal.repository';

@Injectable()
export class GoalCreateUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(data: GoalCreateData): Promise<Goal> {
    return this.goalRepository.create(data);
  }
}
