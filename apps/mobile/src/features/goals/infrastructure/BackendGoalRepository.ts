import { injectable, inject } from "tsyringe";
import { Goal } from "@features/goals/domain/entities/Goal";
import { GoalRepository } from "@features/goals/domain/repositories/GoalRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { GoalId } from "@core/types";
import { GoalDto } from "shared-types";

@injectable()
export class BackendGoalRepository implements GoalRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadAllGoals(): Promise<Goal[]> {
    const response = await this.apiClient.request<GoalDto[]>("/goals");
    return response.map((goal) => this.mapGoal(goal));
  }

  async loadGoalById(goalId: GoalId): Promise<Goal | null> {
    const numericId = this.parseGoalId(goalId);
    if (numericId === null) {
      return null;
    }

    const response = await this.apiClient.requestOrNull<GoalDto>(
      `/goals/${numericId}`,
    );

    if (!response) {
      return null;
    }

    return this.mapGoal(response);
  }

  async saveGoal(goal: Goal): Promise<void> {
    const numericId = this.parseGoalId(goal.id);

    const payload = {
      title: goal.title,
      description: goal.description || null,
    };

    if (numericId !== null) {
      await this.apiClient.request<GoalDto>(`/goals/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      const response = await this.apiClient.request<GoalDto>("/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      goal.id = response.id.toString();
    }
  }

  async deleteGoal(goalId: GoalId): Promise<boolean> {
    const numericId = this.parseGoalId(goalId);
    if (numericId === null) {
      return false;
    }

    try {
      await this.apiClient.request<{ deleted: boolean }>(
        `/goals/${numericId}`,
        {
          method: "DELETE",
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapGoal(dto: GoalDto): Goal {
    return new Goal({
      id: dto.id,
      title: dto.title,
      description: dto.description || undefined,
      start_date: "",
      end_date: "",
      created_at: new Date(dto.createdAt).toISOString(),
      updated_at: new Date(dto.updatedAt).toISOString(),
    });
  }

  private parseGoalId(goalId: GoalId): number | null {
    const parsed = parseInt(goalId, 10);
    return isNaN(parsed) ? null : parsed;
  }
}
