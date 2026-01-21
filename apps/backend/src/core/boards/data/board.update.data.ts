import { Column } from 'src/core/columns/domain/column';

export interface BoardUpdateData {
  name?: string;
  description?: string | null;
  columns?: Column[];
}
