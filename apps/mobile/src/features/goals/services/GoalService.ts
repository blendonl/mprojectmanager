import { injectable, inject } from "tsyringe";
import { Goal } from "../domain/entities/Goal";
import { GoalRepository } from "../domain/repositories/GoalRepository";
import { GoalId } from "@core/types";
import { ValidationError } from "@core/exceptions";
import { GOAL_REPOSITORY } from "@core/di/tokens";

@injectable()
export class GoalService {
  constructor(@inject(GOAL_REPOSITORY) private repository: GoalRepository) {}

  async getAllGoals(): Promise<Goal[]> {
    return await this.repository.loadAllGoals();
  }

  async getGoalById(goalId: GoalId): Promise<Goal> {
    const goal = await this.repository.loadGoalById(goalId);
    if (!goal) {
      throw new ValidationError(`Goal with id '${goalId}' not found`);
    }
    return goal;
  }

  async createGoal(
    title: string,
    description: string
  ): Promise<Goal> {
    const goal = new Goal({
      title: title,
      description: description,
    });

    await this.repository.saveGoal(goal);
    return goal;
  }

  async updateGoal(
    goalId: GoalId,
    updates: Partial<{
      title: string;
      description: string;
    }>
  ): Promise<Goal> {
    const goal = await this.getGoalById(goalId);

    goal.update({
      title: updates.title,
      description: updates.description,
    });

    await this.repository.saveGoal(goal);
    return goal;
  }

  async deleteGoal(goalId: GoalId): Promise<boolean> {
    return await this.repository.deleteGoal(goalId);
  }
}
