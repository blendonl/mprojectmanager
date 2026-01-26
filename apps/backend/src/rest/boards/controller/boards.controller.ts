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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardDto } from 'shared-types';
import { BoardsCoreService } from 'src/core/boards/service/boards.core.service';
import { BoardCreateRequest } from '../dto/board.create.request';
import { BoardListQuery } from '../dto/board.list.query';
import { BoardUpdateRequest } from '../dto/board.update.request';
import { BoardMapper } from '../board.mapper';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  async create(@Body() body: BoardCreateRequest): Promise<BoardDto> {
    const board = await this.boardsService.createBoard({
      id: body.id,
      name: body.name,
      description: body.description || null,
      projectId: body.projectId,
    });

    return BoardMapper.mapToResponse(board);
  }

  @Get()
  @ApiOperation({ summary: 'List all boards' })
  async list(@Query() query: BoardListQuery) {
    const result = await this.boardsService.getBoards({
      page: query.page,
      limit: query.limit,
      projectId: query.projectId,
      search: query.search,
    });

    return {
      items: result.items.map(BoardMapper.mapToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  async getOne(@Param('id') id: string): Promise<BoardDto> {
    const board = await this.boardsService.getBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return BoardMapper.mapToResponse(board);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  async update(
    @Param('id') id: string,
    @Body() body: BoardUpdateRequest,
  ): Promise<BoardDto> {
    const board = await this.boardsService.updateBoard(id, {
      name: body.name,
      description: body.description,
    });

    if (board) {
      return BoardMapper.mapToResponse(board);
    }

    if (!body.projectId || !body.name) {
      throw new NotFoundException('Board not found');
    }

    const created = await this.boardsService.createBoard({
      id,
      name: body.name,
      description: body.description ?? null,
      projectId: body.projectId,
    });

    return BoardMapper.mapToResponse(created);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.boardsService.deleteBoard(id);
    if (!deleted) {
      throw new NotFoundException('Board not found');
    }
    return { deleted };
  }
}
