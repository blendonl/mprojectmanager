import { Column } from 'src/core/columns/domain/column';

export interface Board {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  columns?: Column[];
  createdAt: Date;
  updatedAt: Date;
}
