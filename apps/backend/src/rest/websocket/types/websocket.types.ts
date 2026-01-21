import { EntityType, ChangeType } from '../../../core/events/interfaces/entity-event.interface';

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 'subscribe' | 'unsubscribe' | 'change';

/**
 * Base WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
}

/**
 * Subscribe message payload
 */
export interface SubscribePayload {
  entityTypes?: EntityType[];
}

/**
 * Unsubscribe message payload
 */
export interface UnsubscribePayload {
  entityTypes?: EntityType[];
}

/**
 * Change event payload (server to client)
 */
export interface ChangeEventPayload {
  entityType: EntityType;
  changeType: ChangeType;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
