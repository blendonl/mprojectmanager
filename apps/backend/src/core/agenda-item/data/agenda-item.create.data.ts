import { AgendaItemStatus, AgendaItemType } from '@prisma/client';

export interface AgendaItemCreateData {
  taskId: string;
  type?: AgendaItemType;
  status?: AgendaItemStatus;
  startAt?: Date | null;
  duration?: number | null;
  position?: number;
  notes?: string | null;
  notificationId?: string | null;
}
