import { BoardService } from "../BoardService";
import { ValidationService } from "../ValidationService";
import { Board } from "../../domain/entities/Board";
import { Column } from "../../domain/entities/Column";
import { Task } from "../../domain/entities/Task";
import { BoardRepository } from "../../domain/repositories/BoardRepository";
import { ColumnRepository } from "../../domain/repositories/ColumnRepository";
import { TaskRepository } from "../../domain/repositories/TaskRepository";
import { BoardNotFoundError } from "../../core/exceptions";

class MockBoardRepository implements BoardRepository {
  private boards = new Map<string, Board>();

  async loadBoardsByProjectId(projectId: string): Promise<Board[]> {
    return Array.from(this.boards.values()).filter(
      (board) => board.project_id === projectId,
    );
  }

  async loadAllBoards(): Promise<Board[]> {
    return Array.from(this.boards.values());
  }

  async loadBoardById(boardId: string): Promise<Board | null> {
    return this.boards.get(boardId) ?? null;
  }

  async saveBoard(board: Board): Promise<void> {
    this.boards.set(board.id, board);
  }

  async deleteBoard(boardId: string): Promise<boolean> {
    return this.boards.delete(boardId);
  }

  async createSampleBoard(name: string, projectId: string): Promise<Board> {
    const board = new Board({ name, project_id: projectId });
    this.boards.set(board.id, board);
    return board;
  }

  addBoard(board: Board): void {
    this.boards.set(board.id, board);
  }
}

class MockColumnRepository implements ColumnRepository {
  async listColumns(_boardId: string): Promise<Column[]> {
    return [];
  }

  async createColumn(
    _boardId: string,
    data: { name: string; position?: number; limit?: number | null; color?: string },
  ): Promise<Column> {
    return new Column({
      id: `col-${data.name.toLowerCase()}`,
      name: data.name,
      position: data.position ?? 0,
      limit: data.limit ?? null,
    });
  }

  async updateColumn(
    _boardId: string,
    columnId: string,
    updates: { name?: string; position?: number; limit?: number | null; color?: string },
  ): Promise<Column> {
    return new Column({
      id: columnId,
      name: updates.name ?? "Updated",
      position: updates.position ?? 0,
      limit: updates.limit ?? null,
    });
  }

  async deleteColumn(): Promise<boolean> {
    return true;
  }
}

class MockTaskRepository implements TaskRepository {
  async listTasks(_boardId: string, _columnId: string): Promise<Task[]> {
    return [];
  }

  async createTask(
    _boardId: string,
    columnId: string,
    data: {
      title: string;
      description?: string;
      parentId?: string | null;
      taskType?: string;
      priority?: string;
      position?: number;
    },
  ): Promise<Task> {
    return new Task({
      id: "task-1",
      title: data.title,
      description: data.description ?? "",
      column_id: columnId,
    });
  }

  async updateTask(
    _boardId: string,
    columnId: string,
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      parentId?: string | null;
      columnId?: string;
      taskType?: string;
      priority?: string;
      position?: number;
    },
  ): Promise<Task> {
    return new Task({
      id: taskId,
      title: updates.title ?? "Updated",
      description: updates.description ?? "",
      column_id: columnId,
    });
  }

  async deleteTask(): Promise<boolean> {
    return true;
  }
}

describe("BoardService", () => {
  let boardService: BoardService;
  let boardRepository: MockBoardRepository;
  let columnRepository: MockColumnRepository;

  beforeEach(() => {
    boardRepository = new MockBoardRepository();
    columnRepository = new MockColumnRepository();
    const taskRepository = new MockTaskRepository();
    const validationService = new ValidationService();
    boardService = new BoardService(
      boardRepository,
      columnRepository,
      taskRepository,
      validationService,
      () => {
        throw new Error("ProjectService not needed for these tests");
      },
    );
  });

  it("returns all boards", async () => {
    const board = new Board({ name: "Board", project_id: "project-1" });
    boardRepository.addBoard(board);

    const boards = await boardService.getAllBoards();

    expect(boards).toHaveLength(1);
    expect(boards[0].id).toBe(board.id);
  });

  it("throws when board is missing", async () => {
    await expect(boardService.getBoardById("missing")).rejects.toBeInstanceOf(
      BoardNotFoundError,
    );
  });

  it("adds a column through repository", async () => {
    const board = new Board({ name: "Board", project_id: "project-1" });
    boardRepository.addBoard(board);

    const column = await boardService.addColumnToBoard(board, "New Column", 0);

    expect(column.name).toBe("New Column");
    expect(board.columns).toHaveLength(1);
  });
});
