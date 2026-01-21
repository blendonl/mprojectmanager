import { Column } from '@prisma/client';

export interface BoardCreateData {
  id?: string;
  name: string;
  description?: string | null;
  projectId: string;
  columns?: Column[];
}
