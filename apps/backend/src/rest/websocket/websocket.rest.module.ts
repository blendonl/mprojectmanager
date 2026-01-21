import { Module } from '@nestjs/common';
import { EventsCoreModule } from '../../core/events/events.core.module';
import { ChangesGateway } from './gateways/changes.gateway';
import { SubscriptionManagerService } from './services/subscription-manager.service';

/**
 * WebSocket REST Module
 * Provides real-time change notifications via WebSocket
 */
@Module({
  imports: [EventsCoreModule],
  providers: [ChangesGateway, SubscriptionManagerService],
  exports: [ChangesGateway],
})
export class WebSocketRestModule {}
