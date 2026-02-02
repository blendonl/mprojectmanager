import { useMemo } from 'react';
import { BoardDto, NoteDetailDto, ProjectDto, TaskDto } from 'shared-types';

interface EntityNames {
  projects: Map<string, string>;
  boards: Map<string, string>;
  tasks: Map<string, string>;
}

interface UseEntityNamesOptions {
  notes?: NoteDetailDto[];
  projects?: ProjectDto[];
  boards?: BoardDto[];
  tasks?: TaskDto[];
}

export const useEntityNames = (options: UseEntityNamesOptions = {}) => {
  const { notes, projects = [], boards = [], tasks = [] } = options;

  const entityNames = useMemo<EntityNames>(() => {
    const projectNames = new Map<string, string>();
    const boardNames = new Map<string, string>();
    const taskNames = new Map<string, string>();

    notes?.forEach((note) => {
      note.projects?.forEach((project) => {
        projectNames.set(project.id, project.name);
      });
      note.boards?.forEach((board) => {
        boardNames.set(board.id, board.name);
      });
      note.tasks?.forEach((task) => {
        taskNames.set(task.id, task.title);
      });
    });

    projects.forEach((project) => {
      projectNames.set(project.id, project.name);
    });
    boards.forEach((board) => {
      boardNames.set(board.id, board.name);
    });
    tasks.forEach((task) => {
      taskNames.set(task.id, task.title);
    });

    return { projects: projectNames, boards: boardNames, tasks: taskNames };
  }, [notes, projects, boards, tasks]);

  return {
    entityNames,
    loading: false,
    error: null,
    reload: () => undefined,
  };
};
