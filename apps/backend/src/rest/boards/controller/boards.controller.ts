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
import { BoardsCoreService } from 'src/core/boards/service/boards.core.service';
import { BoardCreateRequest } from '../dto/board.create.request';
import { BoardListQuery } from '../dto/board.list.query';
import { BoardListResponse } from '../dto/board.list.response';
import { BoardResponse } from '../dto/board.response';
import { BoardUpdateRequest } from '../dto/board.update.request';
import { BoardMapper } from '../board.mapper';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsCoreService) {}

  @Post()
  async create(@Body() body: BoardCreateRequest): Promise<BoardResponse> {
    const board = await this.boardsService.createBoard({
      id: body.id,
      name: body.name,
      description: body.description || null,
      projectId: body.projectId,
    });

    return BoardMapper.mapToResponse(board);
  }

  @Get()
  async list(@Query() query: BoardListQuery): Promise<BoardListResponse> {
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
  async getOne(@Param('id') id: string): Promise<BoardResponse> {
    const board = await this.boardsService.getBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return BoardMapper.mapToResponse(board);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: BoardUpdateRequest,
  ): Promise<BoardResponse> {
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
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.boardsService.deleteBoard(id);
    if (!deleted) {
      throw new NotFoundException('Board not found');
    }
    return { deleted };
  }
}
