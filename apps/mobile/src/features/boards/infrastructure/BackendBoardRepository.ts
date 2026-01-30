import { injectable, inject } from "tsyringe";
import { Board } from "../domain/entities/Board";
import { BoardRepository } from "../domain/repositories/BoardRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BoardId, ProjectId } from "@core/types";
import { BoardDto } from "shared-types";
import logger from "@utils/logger";

@injectable()
export class BackendBoardRepository implements BoardRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadBoardsByProjectId(projectId: ProjectId): Promise<Board[]> {
    const response = await this.apiClient.request<{ items: BoardDto[] }>(
      `/boards?projectId=${projectId}`,
    );
    return response.items.map((dto) => Board.fromDto(dto as any));
  }

  async loadAllBoards(): Promise<Board[]> {
    const response = await this.apiClient.request<{ items: BoardDto[] }>(
      `/boards`,
    );
    return response.items.map((dto) => Board.fromDto(dto as any));
  }

  async loadBoardById(boardId: BoardId): Promise<Board | null> {
    logger.info('[BackendBoardRepository] Fetching board from API', { boardId });
    const dto = await this.apiClient.requestOrNull<any>(`/boards/${boardId}`);
    logger.info('[BackendBoardRepository] API response received', {
      boardId,
      hasData: !!dto,
      columnsCount: dto?.columns?.length
    });
    return dto ? Board.fromDto(dto) : null;
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

    const dto = await this.apiClient.request<BoardDto>(`/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return Board.fromDto(dto as any);
  }

  async deleteBoard(boardId: BoardId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/boards/${boardId}`, {
      method: "DELETE",
    });
    return true;
  }
}
