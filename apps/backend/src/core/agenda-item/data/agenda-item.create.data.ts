import { AgendaItemStatus, AgendaItemType } from '@prisma/client';

export interface AgendaItemCreateData {
  taskId?: string | null;
  routineTaskId?: string | null;
  type?: AgendaItemType;
  status?: AgendaItemStatus;
  startAt?: Date | null;
  duration?: number | null;
  position?: number;
  notes?: string | null;
  notificationId?: string | null;
}
