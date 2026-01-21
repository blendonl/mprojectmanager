import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsCoreService } from 'src/core/projects/service/projects.core.service';
import { ProjectCreateRequest } from '../dto/project.create.request';
import { ProjectListQuery } from '../dto/project.list.query';
import { ProjectListResponse } from '../dto/project.list.response';
import { ProjectResponse } from '../dto/project.response';
import { ProjectMapper } from '../project.mapper';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsCoreService) {}

  @Post()
  async create(@Body() body: ProjectCreateRequest): Promise<ProjectResponse> {
    const project = await this.projectsService.createProject({
      name: body.name,
      description: body.description || null,
      slug: body.slug ?? '',
      color: body.color,
      status: body.status,
    });

    return ProjectMapper.mapToResponse(project);
  }

  @Get()
  async list(@Query() query: ProjectListQuery): Promise<ProjectListResponse> {
    const result = await this.projectsService.getProjects({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    });

    return {
      items: result.items.map(ProjectMapper.mapToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ProjectResponse> {
    const project = await this.projectsService.getProjectById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return ProjectMapper.mapToResponse(project);
  }
}
