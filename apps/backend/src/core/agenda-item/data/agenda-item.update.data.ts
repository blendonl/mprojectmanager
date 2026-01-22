import { AgendaItemStatus, AgendaItemType } from '@prisma/client';

export interface AgendaItemUpdateData {
  taskId?: string;
  type?: AgendaItemType;
  status?: AgendaItemStatus;
  startAt?: Date | null;
  duration?: number | null;
  position?: number;
  notes?: string | null;
  completedAt?: Date | null;
  notificationId?: string | null;
}
