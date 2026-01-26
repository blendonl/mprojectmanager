import { injectable, inject } from "tsyringe";
import { Board } from "@features/boards/domain/entities/Board";
import { BoardRepository } from "@features/boards/domain/repositories/BoardRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BoardId, ProjectId } from "@core/types";
import { Column } from "@features/boards/domain/entities/Column";
import { BoardDto } from "shared-types";

@injectable()
export class BackendBoardRepository implements BoardRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadBoardsByProjectId(projectId: ProjectId): Promise<Board[]> {
    const response = await this.apiClient.request<{ items: BoardDto[] }>(
      `/boards?projectId=${projectId}`,
    );
    return response.items.map((board) => this.mapBoard(board));
  }

  async loadAllBoards(): Promise<Board[]> {
    const response = await this.apiClient.request<{ items: BoardDto[] }>(
      `/boards`,
    );
    return response.items.map((board) => this.mapBoard(board));
  }

  async loadBoardById(boardId: BoardId): Promise<Board | null> {
    return this.apiClient.requestOrNull<Board>(
      `/boards/${boardId}`,
    ).then((board) => board ? this.mapBoard(board as any) : null);
  }

  async saveBoard(data: {
    name: string;
    description: string;
    projectId: string;
  }): Promise<Board> {
    const payload = {
      name: data.name,
      description: data.description,
      projectId: data.projectId,
    };

    const response = await this.apiClient.request<BoardDto>(
      `/boards`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapBoard(response);
  }

  async deleteBoard(boardId: BoardId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(
      `/boards/${boardId}`,
      {
        method: "DELETE",
      },
    );
    return true;
  }

  private mapBoard(dto: BoardDto): Board {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      projectId: dto.projectId,
      createdAt: dto.createdAt,
      columns: [],
    };
  }
}
