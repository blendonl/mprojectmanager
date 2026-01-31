import { injectable, inject } from "tsyringe";
import { BoardId, ColumnId } from "@core/types";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { getEventBus } from "@core/EventBus";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { ColumnDto, ColumnCreateRequestDto, ColumnUpdateRequestDto } from "shared-types";

@injectable()
export class ColumnService {
  constructor(
    @inject(BACKEND_API_CLIENT) private apiClient: BackendApiClient,
  ) {}

  async getColumnById(columnId: ColumnId): Promise<ColumnDto | null> {
    return await this.apiClient.requestOrNull<ColumnDto>(`/columns/${columnId}`);
  }

  async createColumn(
    boardId: BoardId,
    name: string,
    position?: number | null,
  ): Promise<ColumnDto> {
    const payload: ColumnCreateRequestDto = {
      name,
      position: position ?? 0,
      boardId,
      wipLimit: undefined,
    };

    return await this.apiClient.request<ColumnDto>(`/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/columns/${columnId}`, {
      method: "DELETE",
    });
    return true;
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null },
  ): Promise<ColumnDto> {
    const payload: ColumnUpdateRequestDto = {
      name: updates.name,
      position: updates.position,
      wipLimit: updates.limit,
    };

    return await this.apiClient.request<ColumnDto>(`/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async reorderColumn(
    boardId: BoardId,
    columnId: ColumnId,
    direction: "left" | "right"
  ): Promise<void> {
    await getEventBus().publish("column_reordered", {
      boardId,
      columnId,
      direction,
      timestamp: new Date(),
    });
  }

  async clearColumn(boardId: BoardId, columnId: ColumnId): Promise<void> {
    await getEventBus().publish("column_cleared", {
      boardId,
      columnId,
      timestamp: new Date(),
    });
  }
}
