import { Module } from '@nestjs/common';
import { GoalsCoreModule } from 'src/core/goals/goals.core.module';
import { GoalController } from './controller/goal.controller';

@Module({
  imports: [GoalsCoreModule],
  controllers: [GoalController],
})
export class GoalRestModule {}
