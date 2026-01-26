import { injectable, inject } from "tsyringe";
import { Note } from "@features/notes/domain/entities/Note";
import { NoteRepository, NoteFilter } from "@features/notes/domain/repositories/NoteRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { NoteId, ProjectId, TaskId, BoardId } from "@core/types";

@injectable()
export class BackendNoteRepository implements NoteRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadAllNotes(): Promise<Note[]> {
    return [];
  }

  async loadNoteById(noteId: NoteId): Promise<Note | null> {
    return null;
  }

  async loadNotesByProject(projectId: ProjectId): Promise<Note[]> {
    return [];
  }

  async loadNotesByBoard(boardId: BoardId): Promise<Note[]> {
    return [];
  }

  async loadNotesByTask(taskId: TaskId): Promise<Note[]> {
    return [];
  }

  async loadNotesByType(noteType: string): Promise<Note[]> {
    return [];
  }

  async loadDailyNote(date: string): Promise<Note | null> {
    return null;
  }

  async loadNotesFiltered(filter: NoteFilter): Promise<Note[]> {
    return [];
  }

  async saveNote(note: Note): Promise<void> {
    console.warn("Backend notes API not implemented yet");
  }

  async deleteNote(noteId: NoteId): Promise<boolean> {
    console.warn("Backend notes API not implemented yet");
    return false;
  }

  async searchNotes(query: string): Promise<Note[]> {
    return [];
  }
}
