import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgendaItemMarkExpiredUnfinishedUseCase } from '../core/agenda-item/usecase/agenda-item.mark-expired-unfinished.usecase';
import { ChangesGateway } from '../websocket/changes.gateway';

@Injectable()
export class AgendaExpiryScheduler {
  private readonly logger = new Logger(AgendaExpiryScheduler.name);

  constructor(
    private readonly markExpiredUseCase: AgendaItemMarkExpiredUnfinishedUseCase,
    private readonly changesGateway: ChangesGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkExpiredAgendaItems() {
    this.logger.log('Running scheduled check for expired agenda items');

    try {
      const result = await this.markExpiredUseCase.execute();

      if (result.markedCount > 0) {
        this.logger.log(
          `Marked ${result.markedCount} items as unfinished, broadcasting changes`,
        );

        result.items.forEach((item) => {
          this.changesGateway.broadcastChange({
            entityType: 'agenda',
            changeType: 'modified',
            entityId: item.id,
            timestamp: new Date().toISOString(),
            metadata: {
              isUnfinished: true,
            },
          });
        });
      }
    } catch (error) {
      this.logger.error('Failed to check expired agenda items', error);
    }
  }
}
