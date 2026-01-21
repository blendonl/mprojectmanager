import { Task } from '@prisma/client';

export interface Column {
  id: string;
  name: string;
  position: number;
  limit: number | null;
  tasks?: Task[];
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
