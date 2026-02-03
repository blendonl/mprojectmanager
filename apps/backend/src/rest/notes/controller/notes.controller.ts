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
import { NoteDto, NoteDetailDto } from 'shared-types';
import { NotesCoreService } from 'src/core/notes/service/notes.core.service';
import { NoteCreateRequest } from '../dto/note.create.request';
import { NoteUpdateRequest } from '../dto/note.update.request';
import { NotesListQuery } from '../dto/notes.list.query';
import { NoteMapper } from '../note.mapper';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(@Body() body: NoteCreateRequest): Promise<NoteDto> {
    const note = await this.notesService.createNote({
      title: body.title,
      content: body.content ?? '',
      type: body.type,
      tags: body.tags ?? [],
      projectIds: body.projects?.map((project) => project.id),
      boardIds: body.boards?.map((board) => board.id),
      taskIds: body.tasks?.map((task) => task.id),
    });

    return NoteMapper.mapToResponse(note);
  }

  @Get()
  @ApiOperation({ summary: 'List notes' })
  async list(@Query() query: NotesListQuery): Promise<NoteDetailDto[]> {
    const notes = await this.notesService.getNotes({
      projectId: query.projectId,
      type: query.type,
    });

    return notes.map(NoteMapper.mapToDetailResponse);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get note by ID' })
  async getOne(@Param('noteId') noteId: string): Promise<NoteDetailDto> {
    const note = await this.notesService.getNoteById(noteId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return NoteMapper.mapToDetailResponse(note);
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update note' })
  async update(
    @Param('noteId') noteId: string,
    @Body() body: NoteUpdateRequest,
  ): Promise<NoteDto> {
    const note = await this.notesService.updateNote(noteId, {
      title: body.title,
      content: body.content,
      type: body.type,
      tags: body.tags,
      projectIds: body.projects?.map((project) => project.id),
      boardIds: body.boards?.map((board) => board.id),
      taskIds: body.tasks?.map((task) => task.id),
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return NoteMapper.mapToResponse(note);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete note' })
  async delete(@Param('noteId') noteId: string): Promise<{ deleted: boolean }> {
    const deleted = await this.notesService.deleteNote(noteId);
    if (!deleted) {
      throw new NotFoundException('Note not found');
    }

    return { deleted };
  }
}
