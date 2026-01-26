import { Inject, Injectable } from '@nestjs/common';
import { Goal } from '@prisma/client';
import {
  GOAL_REPOSITORY,
  type GoalRepository,
} from '../repository/goal.repository';

@Injectable()
export class GoalGetAllUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(): Promise<Goal[]> {
    return this.goalRepository.findAll();
  }
}
