import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  GOAL_REPOSITORY,
  type GoalRepository,
} from '../repository/goal.repository';

@Injectable()
export class GoalDeleteUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existingGoal = await this.goalRepository.findById(id);
    if (!existingGoal) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
    await this.goalRepository.delete(id);
  }
}
