import { Column } from 'src/core/columns/domain/column';

export interface BoardResponse {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}
