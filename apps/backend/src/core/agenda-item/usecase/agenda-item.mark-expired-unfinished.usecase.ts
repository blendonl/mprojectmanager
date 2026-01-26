import { Injectable, Logger } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface MarkExpiredResult {
  markedCount: number;
  items: AgendaItem[];
}

@Injectable()
export class AgendaItemMarkExpiredUnfinishedUseCase {
  private readonly logger = new Logger(
    AgendaItemMarkExpiredUnfinishedUseCase.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<MarkExpiredResult> {
    try {
      const now = new Date();

      const expiredItems = await this.prisma.agendaItem.findMany({
        where: {
          completedAt: null,
          isUnfinished: false,
          startAt: { not: null },
          duration: { not: null },
        },
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
        itemsToMark.map((item) =>
          this.prisma.agendaItem.update({
            where: { id: item.id },
            data: {
              isUnfinished: true,
              unfinishedAt: new Date(),
            },
          }),
        ),
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
