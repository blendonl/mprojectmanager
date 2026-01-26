import { Goal } from '@prisma/client';
import { GoalDto } from 'shared-types';

export class GoalMapper {
  static toResponse(goal: Goal): GoalDto {
    return {
      id: goal.id.toString(),
      title: goal.title,
      description: goal.description,
      status: 'active',
      targetDate: null,
      completedAt: null,
      filePath: null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }
}
