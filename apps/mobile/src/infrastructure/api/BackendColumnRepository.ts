import { Column } from "../../domain/entities/Column";
import { ColumnRepository } from "../../domain/repositories/ColumnRepository";
import { BoardId, ColumnId } from "../../core/types";
import { BackendApiClient } from "./BackendApiClient";

interface ColumnApiResponse {
  id: string;
  name: string;
  position: number;
  limit: number | null;
}

export class BackendColumnRepository implements ColumnRepository {
  constructor(private apiClient: BackendApiClient) {}

  async listColumns(boardId: BoardId): Promise<Column[]> {
    const data = await this.apiClient.request<ColumnApiResponse[]>(
      `/boards/${boardId}/columns`,
    );
    return data.map((column) => this.mapColumn(column));
  }

  async createColumn(
    boardId: BoardId,
    data: { name: string; position?: number; limit?: number | null; color?: string },
  ): Promise<Column> {
    const payload = {
      name: data.name,
      position: data.position,
      limit: data.limit ?? undefined,
      color: data.color ?? "blue",
    };
    const response = await this.apiClient.request<ColumnApiResponse>(
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
    updates: { name?: string; position?: number; limit?: number | null; color?: string },
  ): Promise<Column> {
    const payload = {
      name: updates.name,
      position: updates.position,
      limit: updates.limit ?? undefined,
      color: updates.color,
    };

    const response = await this.apiClient.request<ColumnApiResponse>(
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
    const response = await fetch(
      this.apiClient.buildUrl(`/boards/${boardId}/columns/${columnId}`),
      { method: "DELETE" },
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete column: ${response.status}`);
    }

    return true;
  }

  private mapColumn(column: ColumnApiResponse): Column {
    return new Column({
      id: column.id,
      name: column.name,
      position: column.position,
      limit: column.limit ?? null,
    });
  }
}
