import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface ChangeMessage {
  entityType: string;
  changeType: 'added' | 'modified' | 'deleted';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SubscriptionMessage {
  entityTypes: string[];
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/changes',
  transports: ['websocket', 'polling'],
})
export class ChangesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChangesGateway.name);
  private clientSubscriptions = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientSubscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: SubscriptionMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const subscriptions = this.clientSubscriptions.get(client.id);
    if (!subscriptions) {
      return;
    }

    data.entityTypes.forEach((type) => subscriptions.add(type));

    this.logger.log(
      `Client ${client.id} subscribed to: ${data.entityTypes.join(', ')}`,
    );

    return { success: true, subscribed: data.entityTypes };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: SubscriptionMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const subscriptions = this.clientSubscriptions.get(client.id);
    if (!subscriptions) {
      return;
    }

    data.entityTypes.forEach((type) => subscriptions.delete(type));

    this.logger.log(
      `Client ${client.id} unsubscribed from: ${data.entityTypes.join(', ')}`,
    );

    return { success: true, unsubscribed: data.entityTypes };
  }

  broadcastChange(message: ChangeMessage) {
    this.logger.log(
      `Broadcasting ${message.changeType} for ${message.entityType}:${message.entityId}`,
    );

    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (
        subscriptions.size === 0 ||
        subscriptions.has(message.entityType)
      ) {
        this.server.to(clientId).emit('change', message);
      }
    });
  }
}
