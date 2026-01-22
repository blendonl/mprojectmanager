import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AgendaItemCoreService } from 'src/core/agenda-item/service/agenda-item.core.service';
import { AgendaItemCreateRequest } from '../dto/agenda-item.create.request';
import { AgendaItemUpdateRequest } from '../dto/agenda-item.update.request';
import { AgendaItemResponse } from '../dto/agenda-item.response';
import { AgendaItemMapper } from '../agenda-item.mapper';
import { AgendaMapper } from '../../agenda/agenda.mapper';
import { AgendaItemEnrichedResponse } from '../dto/agenda-item-enriched.response';
import { AgendaItemCompleteRequest } from '../dto/agenda-item-complete.request';
import { AgendaItemRescheduleRequest } from '../dto/agenda-item-reschedule.request';

@Controller('agendas/:agendaId/items')
export class AgendaItemController {
  constructor(private readonly agendaItemService: AgendaItemCoreService) {}

  @Post()
  async create(
    @Param('agendaId') agendaId: string,
    @Body() body: AgendaItemCreateRequest,
  ): Promise<AgendaItemResponse> {
    const item = await this.agendaItemService.createAgendaItem(agendaId, {
      taskId: body.taskId,
      type: body.type,
      status: body.status,
      startAt: body.startAt ? new Date(body.startAt) : null,
      duration: body.duration,
      position: body.position,
      notes: body.notes,
      notificationId: body.notificationId,
    });
    return AgendaItemMapper.toResponse(item);
  }

  @Get()
  async list(@Param('agendaId') agendaId: string): Promise<AgendaItemResponse[]> {
    const items = await this.agendaItemService.getAgendaItems(agendaId);
    return items.map(AgendaItemMapper.toResponse);
  }

  @Get(':itemId')
  async getOne(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
  ): Promise<AgendaItemResponse> {
    const item = await this.agendaItemService.getAgendaItem(itemId);
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }
    return AgendaItemMapper.toResponse(item);
  }

  @Put(':itemId')
  async update(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemUpdateRequest,
  ): Promise<AgendaItemResponse> {
    const item = await this.agendaItemService.updateAgendaItem(itemId, {
      taskId: body.taskId,
      type: body.type,
      status: body.status,
      startAt: body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      duration: body.duration,
      position: body.position,
      notes: body.notes,
      notificationId: body.notificationId,
    });
    return AgendaItemMapper.toResponse(item);
  }

  @Delete(':itemId')
  async delete(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
  ): Promise<{ deleted: boolean }> {
    await this.agendaItemService.deleteAgendaItem(itemId);
    return { deleted: true };
  }

  @Put(':itemId/complete')
  async complete(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemCompleteRequest,
  ): Promise<AgendaItemResponse> {
    const item = await this.agendaItemService.completeAgendaItem(
      itemId,
      body.completedAt ? new Date(body.completedAt) : undefined,
      body.notes,
    );
    return AgendaItemMapper.toResponse(item);
  }

  @Put(':itemId/reschedule')
  async reschedule(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemRescheduleRequest,
  ): Promise<AgendaItemResponse> {
    const item = await this.agendaItemService.rescheduleAgendaItem(
      itemId,
      new Date(body.newDate),
      body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      body.duration,
    );
    return AgendaItemMapper.toResponse(item);
  }
}

@Controller('agenda-items')
export class AgendaItemGlobalController {
  constructor(private readonly agendaItemService: AgendaItemCoreService) {}

  @Get('orphaned')
  async getOrphaned(): Promise<AgendaItemEnrichedResponse[]> {
    const items = await this.agendaItemService.getOrphanedAgendaItems();
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('overdue')
  async getOverdue(): Promise<AgendaItemEnrichedResponse[]> {
    const items = await this.agendaItemService.getOverdueAgendaItems();
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('upcoming')
  async getUpcoming(@Query('days') days?: string): Promise<AgendaItemEnrichedResponse[]> {
    const numDays = days ? parseInt(days, 10) : 7;
    const items = await this.agendaItemService.getUpcomingAgendaItems(numDays);
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('unfinished')
  async getUnfinished(
    @Query('beforeDate') beforeDate?: string,
  ): Promise<AgendaItemEnrichedResponse[]> {
    const items = await this.agendaItemService.getUnfinishedAgendaItems(
      beforeDate ? new Date(beforeDate) : undefined,
    );
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }
}
