import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ColumnCreateRequest } from '../dto/column.create.request';
import { ColumnResponse } from '../dto/column.response';
import { ColumnUpdateRequest } from '../dto/column.update.request';
import { ColumnsCoreService } from 'src/core/columns/service/columns.core.service';

@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsCoreService) {}

  @Post()
  async create(
    @Param('boardId') boardId: string,
    @Body() body: ColumnCreateRequest,
  ): Promise<ColumnResponse> {
    const column = await this.columnsService.createColumn(boardId, {
      name: body.name,
      color: body.color,
      position: body.position,
      limit: body.limit ?? undefined,
    });

    if (!column) {
      throw new NotFoundException('Board not found');
    }

    return column;
  }

  @Get()
  async list(@Param('boardId') boardId: string): Promise<ColumnResponse[]> {
    const columns = await this.columnsService.getColumns(boardId);
    if (!columns) {
      throw new NotFoundException('Board not found');
    }

    return columns.map((column) => ({
      ...column,
      tasks: Array.isArray(column.tasks) ? column.tasks : [],
      limit: column.limit ?? null,
    }));
  }

  @Get(':columnId')
  async getOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ): Promise<ColumnResponse> {
    const column = await this.columnsService.getColumn(columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return {
      ...column,
      limit: column.limit ?? null,
    };
  }

  @Put(':columnId')
  async update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() body: ColumnUpdateRequest,
  ): Promise<ColumnResponse> {
    const column = await this.columnsService.updateColumn(columnId, {
      name: body.name,
      position: body.position,
      limit: body.limit,
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  @Delete(':columnId')
  async delete(
    @Param('columnId') columnId: string,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.columnsService.deleteColumn(columnId);

    if (!deleted) {
      throw new NotFoundException('Column not found');
    }

    return { deleted };
  }
}
