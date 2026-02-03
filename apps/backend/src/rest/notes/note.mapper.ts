import { NoteDto, NoteDetailDto, ProjectDto, BoardDto, TaskDto } from 'shared-types';
import { NoteFindOneData } from 'src/core/notes/data/note.find.one.data';
import { BoardMapper } from '../boards/board.mapper';
import { ProjectMapper } from '../projects/project.mapper';
import { TaskMapper } from '../task/task.mapper';

export class NoteMapper {
  static mapToResponse(note: NoteFindOneData): NoteDto {
    const content = note.content ?? '';
    const preview = content.trim() ? content.slice(0, 160) : null;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    return {
      id: note.id,
      type: note.type,
      title: note.title,
      content: note.content,
      preview,
      tags: note.tags ?? [],
      projects: (note.projects ?? []).map(ProjectMapper.mapToResponse) as ProjectDto[],
      boards: (note.boards ?? []).map(BoardMapper.mapToResponse) as BoardDto[],
      tasks: (note.tasks ?? []).map(TaskMapper.toResponse) as TaskDto[],
      wordCount,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  static mapToDetailResponse(note: NoteFindOneData): NoteDetailDto {
    return NoteMapper.mapToResponse(note);
  }
}
