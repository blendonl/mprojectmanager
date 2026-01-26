import { Module } from '@nestjs/common';
import { AlarmsCoreModule } from 'src/core/alarms/alarms.core.module';
import { AlarmPlanController } from './controller/alarm-plan.controller';

@Module({
  imports: [AlarmsCoreModule],
  controllers: [AlarmPlanController],
})
export class AlarmRestModule {}
