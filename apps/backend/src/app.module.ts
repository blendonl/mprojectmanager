import { Module } from '@nestjs/common';
import { RestModule } from 'src/rest/rest.module';
import { CoreModule } from 'src/core/core.module';
import { WebSocketModule } from 'src/websocket/websocket.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { AppController } from './rest/app/app.controller';
import { AppService } from './rest/app/app.service';

@Module({
  imports: [RestModule, CoreModule, WebSocketModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
