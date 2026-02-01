import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';
import { AgendaItem, AgendaItemStatus } from '@prisma/client';

@Injectable()
export class AgendaItemMarkExpiredAsUnfinishedUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(
    items: AgendaItem[],
    currentTime: Date = new Date(),
  ): Promise<AgendaItem[]> {
    const updatedItems: AgendaItem[] = [];

    for (const item of items) {
      if (!item.startAt || !item.duration) {
        updatedItems.push(item);
        continue;
      }

      if (item.status !== AgendaItemStatus.PENDING) {
        updatedItems.push(item);
        continue;
      }

      const endTime = new Date(
        item.startAt.getTime() + item.duration * 60 * 1000,
      );

      if (currentTime > endTime) {
        const updated = await this.agendaItemRepository.update(item.id, {
          status: AgendaItemStatus.UNFINISHED,
        });
        updatedItems.push(updated);
      } else {
        updatedItems.push(item);
      }
    }

    return updatedItems;
  }

  isExpired(item: AgendaItem, currentTime: Date = new Date()): boolean {
    if (!item.startAt || !item.duration) {
      return false;
    }

    if (item.status !== AgendaItemStatus.PENDING) {
      return false;
    }

    const endTime = new Date(
      item.startAt.getTime() + item.duration * 60 * 1000,
    );

    return currentTime > endTime;
  }
}
