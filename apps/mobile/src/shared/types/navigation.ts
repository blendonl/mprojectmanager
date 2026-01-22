import { BoardId, ProjectId, TaskId, NoteId, GoalId, TimeLogId } from "@core/types";

export type RootStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { projectId: ProjectId };
  BoardList: { projectId: ProjectId };
  Board: { boardId: BoardId; projectId: ProjectId };
  ItemDetail: { taskId: TaskId; boardId: BoardId; projectId: ProjectId };
  AgendaDay: { date: string };
  AgendaItemDetail: { itemId: string };
  TaskSchedule: { taskId: TaskId; boardId: BoardId };
  NotesList: undefined;
  NoteEditor: { noteId?: NoteId };
  GoalsList: undefined;
  GoalDetail: { goalId: GoalId };
  TimeOverview: undefined;
  TimeLogDetail: { logId: TimeLogId };
  Settings: undefined;
};
