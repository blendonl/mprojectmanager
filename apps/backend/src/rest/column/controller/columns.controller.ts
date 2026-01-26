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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ColumnDto } from 'shared-types';
import { ColumnCreateRequest } from '../dto/column.create.request';
import { ColumnUpdateRequest } from '../dto/column.update.request';
import { ColumnsCoreService } from 'src/core/columns/service/columns.core.service';
import { ColumnMapper } from '../column.mapper';

@ApiTags('columns')
@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  async create(
    @Param('boardId') boardId: string,
    @Body() body: ColumnCreateRequest,
  ): Promise<ColumnDto> {
    const column = await this.columnsService.createColumn(boardId, {
      name: body.name,
      color: body.color,
      position: body.position,
      limit: body.limit ?? undefined,
    });

    if (!column) {
      throw new NotFoundException('Board not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Get()
  @ApiOperation({ summary: 'List all columns in a board' })
  async list(@Param('boardId') boardId: string): Promise<ColumnDto[]> {
    const columns = await this.columnsService.getColumns(boardId);
    if (!columns) {
      throw new NotFoundException('Board not found');
    }

    return columns.map(ColumnMapper.toResponse);
  }

  @Get(':columnId')
  @ApiOperation({ summary: 'Get column by ID' })
  async getOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ): Promise<ColumnDto> {
    const column = await this.columnsService.getColumn(columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Put(':columnId')
  @ApiOperation({ summary: 'Update column' })
  async update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() body: ColumnUpdateRequest,
  ): Promise<ColumnDto> {
    const column = await this.columnsService.updateColumn(columnId, {
      name: body.name,
      position: body.position,
      limit: body.limit,
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Delete(':columnId')
  @ApiOperation({ summary: 'Delete column' })
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
