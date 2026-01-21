import { Module } from '@nestjs/common';
import { ProjectsCoreModule } from 'src/core/projects/projects.core.module';
import { ProjectsController } from './controller/projects.controller';

@Module({
  imports: [ProjectsCoreModule],
  controllers: [ProjectsController],
})
export class ProjectsRestModule {}
