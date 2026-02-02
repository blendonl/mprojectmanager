import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { uiConstants } from '@shared/theme/uiConstants';
import { getNoteService } from '@core/di/hooks';
import { BoardDto, NoteDetailDto, NoteType, ProjectDto, TaskDto } from 'shared-types';
import { SaveStatus } from '@shared/components/AutoSaveIndicator';

interface NoteData {
  type?: NoteType;
  title: string;
  content: string;
  tags: string[];
  projects: ProjectDto[];
  boards: BoardDto[];
  tasks: TaskDto[];
}

interface UseNoteAutoSaveOptions {
  note: NoteDetailDto | null;
  noteData: NoteData;
  onNoteSaved?: (note: NoteDetailDto) => void;
}

export const useNoteAutoSave = ({ note, noteData, onNoteSaved }: UseNoteAutoSaveOptions) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isInitialMount = useRef(true);

  const debouncedTitle = useDebounce(noteData.title, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);
  const debouncedContent = useDebounce(noteData.content, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);
  const debouncedTags = useDebounce(noteData.tags, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);

  const saveNote = useCallback(async () => {
    if (!noteData.title.trim()) return;

    setSaveStatus('saving');
    try {
      const noteService = getNoteService();
      if (note) {
        await noteService.updateNote(note.id, {
          title: noteData.title.trim(),
          content: noteData.content,
          tags: noteData.tags,
          projects: noteData.projects,
          boards: noteData.boards,
          tasks: noteData.tasks,
          type: noteData.type,
        });
      } else {
        const newNoteDto = await noteService.createNote({
          title: noteData.title.trim(),
          content: noteData.content,
          type: noteData.type ?? NoteType.General,
          projects: noteData.projects,
          boards: noteData.boards,
          tasks: noteData.tasks,
          tags: noteData.tags,
        });
        const fullNote = await noteService.getNoteById(newNoteDto.id);
        if (fullNote) {
          onNoteSaved?.(fullNote);
        }
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [note, noteData, onNoteSaved]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!debouncedTitle.trim()) {
      return;
    }

    saveNote();
  }, [
    debouncedTitle,
    debouncedContent,
    debouncedTags,
    noteData.projects,
    noteData.boards,
    noteData.tasks,
    noteData.type,
  ]);

  return {
    saveStatus,
    saveNote,
  };
};
