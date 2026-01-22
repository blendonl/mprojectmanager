import { AgendaItemStatus, AgendaItemType } from '@prisma/client';

export interface AgendaItemResponse {
  id: string;
  agendaId: string;
  taskId: string;
  type: AgendaItemType;
  status: AgendaItemStatus;
  startAt: string | null;
  duration: number | null;
  position: number;
  notes: string | null;
  completedAt: string | null;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}
