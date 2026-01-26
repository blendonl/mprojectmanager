import { Injectable } from '@nestjs/common';
import { GoalCreateData } from '../data/goal.create.data';
import { GoalUpdateData } from '../data/goal.update.data';
import { GoalCreateUseCase } from '../usecase/goal.create.usecase';
import { GoalDeleteUseCase } from '../usecase/goal.delete.usecase';
import { GoalGetAllUseCase } from '../usecase/goal.get-all.usecase';
import { GoalGetOneUseCase } from '../usecase/goal.get-one.usecase';
import { GoalUpdateUseCase } from '../usecase/goal.update.usecase';

@Injectable()
export class GoalsCoreService {
  constructor(
    private readonly goalCreateUseCase: GoalCreateUseCase,
    private readonly goalGetAllUseCase: GoalGetAllUseCase,
    private readonly goalGetOneUseCase: GoalGetOneUseCase,
    private readonly goalUpdateUseCase: GoalUpdateUseCase,
    private readonly goalDeleteUseCase: GoalDeleteUseCase,
  ) {}

  async createGoal(data: GoalCreateData) {
    return this.goalCreateUseCase.execute(data);
  }

  async getGoals() {
    return this.goalGetAllUseCase.execute();
  }

  async getGoal(id: number) {
    return this.goalGetOneUseCase.execute(id);
  }

  async updateGoal(id: number, data: GoalUpdateData) {
    return this.goalUpdateUseCase.execute(id, data);
  }

  async deleteGoal(id: number) {
    return this.goalDeleteUseCase.execute(id);
  }
}
