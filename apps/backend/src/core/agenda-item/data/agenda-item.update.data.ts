import { AgendaItemStatus, AgendaItemType } from '@prisma/client';

export interface AgendaItemUpdateData {
  taskId?: string;
  routineTaskId?: string | null;
  type?: AgendaItemType;
  status?: AgendaItemStatus;
  startAt?: Date | null;
  duration?: number | null;
  position?: number;
  notes?: string | null;
  completedAt?: Date | null;
  notificationId?: string | null;
  unfinishedAt?: Date | null;
  isUnfinished?: boolean;
}
