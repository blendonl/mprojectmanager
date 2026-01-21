import { Module } from '@nestjs/common';
import { RestModule } from 'src/rest/rest.module';
import { CoreModule } from 'src/core/core.module';
import { AppController } from './rest/app/app.controller';
import { AppService } from './rest/app/app.service';

@Module({
  imports: [RestModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
