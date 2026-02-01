import { Injectable, Logger } from '@nestjs/common';
import { AgendaItem, AgendaItemStatus, AgendaItemLogType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaItemLogCreateUseCase } from './agenda-item-log.create.usecase';

export interface MarkExpiredResult {
  markedCount: number;
  items: AgendaItem[];
}

@Injectable()
export class AgendaItemMarkExpiredUnfinishedUseCase {
  private readonly logger = new Logger(
    AgendaItemMarkExpiredUnfinishedUseCase.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly logUseCase: AgendaItemLogCreateUseCase,
  ) {}

  async execute(): Promise<MarkExpiredResult> {
    try {
      const now = new Date();

      const expiredItems = await this.prisma.agendaItem.findMany({
        where: {
          status: AgendaItemStatus.PENDING,
          startAt: { not: null },
          duration: { not: null },
        },
        include: { logs: { orderBy: { createdAt: 'asc' } } },
      });

      const itemsToMark = expiredItems.filter((item) => {
        if (!item.startAt || !item.duration) {
          return false;
        }

        const endTime = new Date(
          item.startAt.getTime() + item.duration * 60000,
        );

        return endTime < now;
      });

      if (itemsToMark.length === 0) {
        return { markedCount: 0, items: [] };
      }

      this.logger.log(
        `Found ${itemsToMark.length} expired agenda items to mark as unfinished`,
      );

      const markedItems = await Promise.all(
        itemsToMark.map(async (item) => {
          const updated = await this.prisma.agendaItem.update({
            where: { id: item.id },
            data: {
              status: AgendaItemStatus.UNFINISHED,
            },
            include: { logs: { orderBy: { createdAt: 'asc' } } },
          });

          await this.logUseCase.execute({
            agendaItemId: item.id,
            type: AgendaItemLogType.MARKED_UNFINISHED,
            previousValue: { status: item.status },
            newValue: { status: AgendaItemStatus.UNFINISHED, markedAt: now },
            notes: 'Automatically marked as unfinished due to expiration',
          });

          return updated;
        }),
      );

      this.logger.log(
        `Marked ${markedItems.length} expired agenda items as unfinished`,
      );

      return {
        markedCount: markedItems.length,
        items: markedItems,
      };
    } catch (error) {
      this.logger.error('Failed to mark expired agenda items', error);
      throw error;
    }
  }
}
