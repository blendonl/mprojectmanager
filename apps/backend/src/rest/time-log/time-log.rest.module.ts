import { Module } from '@nestjs/common';
import { TimeLogsCoreModule } from 'src/core/time-logs/time-logs.core.module';
import { TimeLogController } from './controller/time-log.controller';

@Module({
  imports: [TimeLogsCoreModule],
  controllers: [TimeLogController],
})
export class TimeLogRestModule {}
