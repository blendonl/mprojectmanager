import { BoardId, ProjectId } from "../../core/types";
import { Board } from "../../domain/entities/Board";
import { BoardRepository } from "../../domain/repositories/BoardRepository";
import { ColumnRepository } from "../../domain/repositories/ColumnRepository";
import { TaskRepository } from "../../domain/repositories/TaskRepository";
import { BackendApiClient } from "./BackendApiClient";

interface BoardApiResponse {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardListResponse {
  items: BoardApiResponse[];
  total: number;
  page: number;
  limit: number;
}

export class BackendBoardRepository implements BoardRepository {
  constructor(
    private apiClient: BackendApiClient,
    private columnRepository: ColumnRepository,
    private taskRepository: TaskRepository,
  ) {}

  async loadBoardsByProjectId(projectId: ProjectId): Promise<Board[]> {
    return await this.loadBoardsWithOptions({ projectId });
  }

  async loadAllBoards(): Promise<Board[]> {
    return await this.loadBoardsWithOptions({});
  }

  private async loadBoardsWithOptions(options: { projectId?: ProjectId }): Promise<Board[]> {
    const boards: Board[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const params = [`page=${page}`, `limit=${limit}`];
      if (options.projectId) {
        params.push(`projectId=${encodeURIComponent(options.projectId)}`);
      }

      const response = await this.apiClient.request<BoardListResponse>(
        `/boards?${params.join("&")}`,
      );

      const hydrated = await Promise.all(
        response.items.map((item) => this.hydrateBoard(item)),
      );
      boards.push(...hydrated);

      if (boards.length >= response.total) {
        break;
      }

      page += 1;
    }

    return boards;
  }

  async loadBoardById(boardId: BoardId): Promise<Board | null> {
    const data = await this.apiClient.requestOrNull<BoardApiResponse>(
      `/boards/${boardId}`,
    );
    if (!data) {
      return null;
    }
    return await this.hydrateBoard(data);
  }

  async saveBoard(board: Board): Promise<void> {
    const payload = {
      id: board.id,
      name: board.name,
      description: board.description || null,
      projectId: board.project_id,
    };

    await this.apiClient.request<BoardApiResponse>(`/boards/${board.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async deleteBoard(boardId: BoardId): Promise<boolean> {
    const response = await fetch(this.apiClient.buildUrl(`/boards/${boardId}`), {
      method: "DELETE",
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete board: ${response.status}`);
    }

    return true;
  }

  async createSampleBoard(name: string, projectId: ProjectId): Promise<Board> {
    const board = new Board({
      name,
      project_id: projectId,
      description: "Sample board for getting started",
    });

    await this.saveBoard(board);
    board.columns = await Promise.all([
      this.columnRepository.createColumn(board.id, { name: "To Do", position: 0 }),
      this.columnRepository.createColumn(board.id, { name: "In Progress", position: 1 }),
      this.columnRepository.createColumn(board.id, { name: "Done", position: 2 }),
    ]);
    return board;
  }

  private async hydrateBoard(board: BoardApiResponse): Promise<Board> {
    const columns = await this.columnRepository.listColumns(board.id);
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await this.taskRepository.listTasks(board.id, column.id);
        column.tasks = tasks;
        return column;
      }),
    );

    return new Board({
      id: board.id,
      name: board.name,
      project_id: board.projectId,
      description: board.description || "",
      columns: columnsWithTasks,
      parents: [],
      created_at: board.createdAt ? new Date(board.createdAt) : undefined,
    });
  }
}
