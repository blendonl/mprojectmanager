import { AgendaItemStatus } from '@prisma/client';

export interface AgendaItem {
  id: string;
  agendaId: string;
  taskId: string;
  status: AgendaItemStatus;
  startAt: Date | null;
  duration: number | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
