import { injectable, inject } from "tsyringe";
import { Column } from "@features/boards/domain/entities/Column";
import { ColumnRepository } from "@features/boards/domain/repositories/ColumnRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BoardId, ColumnId } from "@core/types";
import { ColumnDto } from "shared-types";

@injectable()
export class BackendColumnRepository implements ColumnRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async listColumns(boardId: BoardId): Promise<Column[]> {
    const response = await this.apiClient.request<ColumnDto[]>(
      `/boards/${boardId}/columns`,
    );
    return response.map((column) => this.mapColumn(column));
  }

  async createColumn(
    boardId: BoardId,
    data: { name: string; position?: number; limit?: number | null; color?: string }
  ): Promise<Column> {
    const payload = {
      name: data.name,
      position: data.position ?? 0,
      limit: data.limit ?? null,
      color: data.color ?? "#3B82F6",
    };

    const response = await this.apiClient.request<ColumnDto>(
      `/boards/${boardId}/columns`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapColumn(response);
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null; color?: string }
  ): Promise<Column> {
    const payload = {
      name: updates.name,
      position: updates.position,
      limit: updates.limit,
      color: updates.color,
    };

    const response = await this.apiClient.request<ColumnDto>(
      `/boards/${boardId}/columns/${columnId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapColumn(response);
  }

  async deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(
      `/boards/${boardId}/columns/${columnId}`,
      {
        method: "DELETE",
      },
    );
    return true;
  }

  private mapColumn(dto: ColumnDto): Column {
    return new Column({
      id: dto.id,
      name: dto.name,
      position: dto.position,
      limit: dto.wipLimit,
      color: "#3B82F6",
      created_at: new Date(dto.createdAt),
    });
  }
}
