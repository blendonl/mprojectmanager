import { BoardId, ProjectId, Timestamp } from "@core/types";
import { Column } from "@features/columns/domain/entities/Column";
import { Task } from "@features/tasks/domain/entities/Task";
import { now } from "@utils/dateUtils";
import { BoardDetailDto } from "@mprojectmanager/shared-types";

export interface BoardProps {
  id?: BoardId;
  name: string;
  projectId: ProjectId;
  description?: string | null;
  color?: string;
  slug?: string;
  columns?: Column[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export class Board {
  id: BoardId;
  name: string;
  projectId: ProjectId;
  description: string | null;
  color: string;
  slug: string;
  columns: Column[];
  createdAt: Timestamp;
  updatedAt: Timestamp;

  constructor(props: BoardProps) {
    this.id = props.id || "";
    this.name = props.name;
    this.projectId = props.projectId;
    this.description = props.description ?? null;
    this.color = props.color || "#3B82F6";
    this.slug = props.slug || this.name.toLowerCase().replace(/\s+/g, "-");
    this.columns = props.columns || [];
    this.createdAt = props.createdAt || now();
    this.updatedAt = props.updatedAt || now();
  }

  getColumnById(columnId: string): Column | null {
    return this.columns.find((col) => col.id === columnId) || null;
  }

  addColumn(column: Column): void {
    this.columns.push(column);
    this.updatedAt = now();
  }

  updateColumn(columnId: string, updates: Partial<Column>): boolean {
    const column = this.getColumnById(columnId);
    if (!column) return false;

    Object.assign(column, updates);
    this.updatedAt = now();
    return true;
  }

  removeColumn(columnId: string): boolean {
    const originalLength = this.columns.length;
    this.columns = this.columns.filter((col) => col.id !== columnId);

    if (this.columns.length < originalLength) {
      this.updatedAt = now();
      return true;
    }
    return false;
  }

  getTaskById(taskId: string): Task | null {
    for (const column of this.columns) {
      const task = column.getTaskById(taskId);
      if (task) return task;
    }
    return null;
  }

  removeTask(taskId: string): boolean {
    for (const column of this.columns) {
      if (column.removeTask(taskId)) {
        this.updatedAt = now();
        return true;
      }
    }
    return false;
  }

  getAllTasks(): Task[] {
    return this.columns.flatMap((column) => column.getAllTasks());
  }

  toDict(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      projectId: this.projectId,
      description: this.description,
      color: this.color,
      slug: this.slug,
      createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
      columns: this.columns.map((col) => col.toDict()),
    };
  }

  static fromDto(dto: BoardDetailDto & { columns?: any[] }): Board {
    return new Board({
      id: dto.id,
      name: dto.name,
      projectId: dto.projectId,
      description: dto.description,
      color: dto.color,
      slug: dto.slug,
      columns: (dto.columns || []).map((colData: any) => {
        if (colData instanceof Column) {
          return colData;
        }

        return new Column({
          id: colData.id,
          name: colData.name,
          position: colData.position,
          color: colData.color,
          limit: colData.wipLimit ?? colData.limit,
          tasks: (colData.tasks || []).map((taskData: any) => {
            if (taskData instanceof Task) {
              return taskData;
            }
            return Task.fromDict(taskData);
          }),
        });
      }),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    });
  }

  static fromDict(data: Record<string, any>): Board {
    return new Board({
      id: data.id,
      name: data.name,
      projectId: data.projectId,
      description: data.description,
      color: data.color,
      slug: data.slug,
      columns: (data.columns || []).map((colData: any) => Column.fromDict(colData)),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }
}
