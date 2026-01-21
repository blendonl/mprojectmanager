import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EntityEventEmitter } from '../../../core/events/services/entity-event-emitter.service';
import { SubscriptionManagerService } from '../services/subscription-manager.service';
import { SubscribeMessageDto } from '../dto/subscribe-message.dto';
import { UnsubscribeMessageDto } from '../dto/unsubscribe-message.dto';
import { ChangeEventDto } from '../dto/change-event.dto';
import { EntityEvent } from '../../../core/events/interfaces/entity-event.interface';

/**
 * WebSocket Gateway for real-time entity change notifications
 * Endpoint: /ws/changes
 */
@WebSocketGateway({
  path: '/ws/changes',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChangesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChangesGateway.name);

  constructor(
    private readonly subscriptionManager: SubscriptionManagerService,
    private readonly eventEmitter: EntityEventEmitter,
  ) {}

  /**
   * Initialize gateway and subscribe to all entity events
   */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized at /ws/changes');

    // Subscribe to all entity change events (*.*)
    this.eventEmitter.on('*.*', (event: EntityEvent) => {
      this.handleEntityEvent(event);
    });
  }

  /**
   * Handle new client connections
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.subscriptionManager.registerClient(client.id);

    // Send welcome message
    client.emit('connected', {
      message: 'Connected to changes stream',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle client disconnections
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.subscriptionManager.unregisterClient(client.id);
  }

  /**
   * Handle subscribe messages from clients
   * Message format: { type: 'subscribe', payload: { entityTypes: ['board', 'task'] }, timestamp: '...' }
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribeMessageDto,
  ) {
    try {
      const { entityTypes } = data;
      this.subscriptionManager.subscribe(client.id, entityTypes);

      const subscriptions =
        this.subscriptionManager.getClientSubscriptions(client.id);

      this.logger.debug(
        `Client ${client.id} subscribed to: ${subscriptions === 'all' ? 'all' : subscriptions.join(', ')}`,
      );

      // Send confirmation
      client.emit('subscribed', {
        entityTypes: subscriptions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error handling subscribe from ${client.id}:`, error);
      client.emit('error', {
        message: 'Failed to process subscription',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle unsubscribe messages from clients
   * Message format: { type: 'unsubscribe', payload: { entityTypes: ['board'] }, timestamp: '...' }
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UnsubscribeMessageDto,
  ) {
    try {
      const { entityTypes } = data;
      this.subscriptionManager.unsubscribe(client.id, entityTypes);

      const subscriptions =
        this.subscriptionManager.getClientSubscriptions(client.id);

      this.logger.debug(
        `Client ${client.id} remaining subscriptions: ${subscriptions === 'all' ? 'all' : subscriptions.join(', ')}`,
      );

      // Send confirmation
      client.emit('unsubscribed', {
        entityTypes: subscriptions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error handling unsubscribe from ${client.id}:`, error);
      client.emit('error', {
        message: 'Failed to process unsubscription',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle entity change events and broadcast to subscribed clients
   */
  private handleEntityEvent(event: EntityEvent) {
    try {
      // Get clients subscribed to this entity type
      const subscribedClients = this.subscriptionManager.getSubscribedClients(
        event.entityType,
      );

      if (subscribedClients.length === 0) {
        this.logger.debug(
          `No clients subscribed to ${event.entityType}.${event.changeType}`,
        );
        return;
      }

      // Create change event message
      const changeEvent = new ChangeEventDto(
        event.entityType,
        event.changeType,
        event.entityId,
        event.timestamp,
        event.metadata,
      );

      // Broadcast to subscribed clients
      subscribedClients.forEach((clientId) => {
        this.server.to(clientId).emit('change', changeEvent);
      });

      this.logger.debug(
        `Broadcasted ${event.entityType}.${event.changeType} to ${subscribedClients.length} client(s)`,
      );
    } catch (error) {
      this.logger.error('Error broadcasting entity event:', error);
    }
  }

  /**
   * Get gateway statistics (for debugging)
   */
  getStats() {
    return {
      connectedClients: this.subscriptionManager.getClientCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
