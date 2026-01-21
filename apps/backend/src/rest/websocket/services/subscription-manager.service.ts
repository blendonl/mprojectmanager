import { Injectable, Logger } from '@nestjs/common';
import { EntityType } from '../../../core/events/interfaces/entity-event.interface';

/**
 * Subscription Manager Service
 * Manages WebSocket client subscriptions to entity types
 * - Empty set = subscribed to ALL entity types
 * - Non-empty set = subscribed to specific entity types
 */
@Injectable()
export class SubscriptionManagerService {
  private readonly logger = new Logger(SubscriptionManagerService.name);

  // Map of client ID to set of entity types they're subscribed to
  private readonly subscriptions = new Map<string, Set<EntityType>>();

  /**
   * Register a new client (subscribes to all entity types by default)
   */
  registerClient(clientId: string): void {
    if (!this.subscriptions.has(clientId)) {
      // Empty set = subscribed to all
      this.subscriptions.set(clientId, new Set());
      this.logger.debug(`Client ${clientId} registered (subscribed to all)`);
    }
  }

  /**
   * Unregister a client and cleanup their subscriptions
   */
  unregisterClient(clientId: string): void {
    if (this.subscriptions.delete(clientId)) {
      this.logger.debug(`Client ${clientId} unregistered`);
    }
  }

  /**
   * Subscribe a client to specific entity types
   * If entityTypes is empty/undefined, subscribe to all
   */
  subscribe(clientId: string, entityTypes?: EntityType[]): void {
    const subscriptions = this.subscriptions.get(clientId);

    if (!subscriptions) {
      this.logger.warn(`Cannot subscribe: client ${clientId} not registered`);
      return;
    }

    if (!entityTypes || entityTypes.length === 0) {
      // Empty set = subscribe to all
      subscriptions.clear();
      this.logger.debug(`Client ${clientId} subscribed to all entity types`);
    } else {
      // Add specific entity types
      entityTypes.forEach((type) => subscriptions.add(type));
      this.logger.debug(
        `Client ${clientId} subscribed to: ${Array.from(subscriptions).join(', ')}`,
      );
    }
  }

  /**
   * Unsubscribe a client from specific entity types
   * If entityTypes is empty/undefined, unsubscribe from all
   */
  unsubscribe(clientId: string, entityTypes?: EntityType[]): void {
    const subscriptions = this.subscriptions.get(clientId);

    if (!subscriptions) {
      this.logger.warn(`Cannot unsubscribe: client ${clientId} not registered`);
      return;
    }

    if (!entityTypes || entityTypes.length === 0) {
      // Clear all subscriptions (but keep client registered)
      subscriptions.clear();
      this.logger.debug(`Client ${clientId} unsubscribed from all`);
    } else {
      // Remove specific entity types
      entityTypes.forEach((type) => subscriptions.delete(type));
      this.logger.debug(
        `Client ${clientId} remaining subscriptions: ${Array.from(subscriptions).join(', ') || 'all'}`,
      );
    }
  }

  /**
   * Get all client IDs that should receive notifications for a given entity type
   * Returns clients who are either:
   * - Subscribed to all (empty set)
   * - Subscribed to the specific entity type
   */
  getSubscribedClients(entityType: EntityType): string[] {
    const clients: string[] = [];

    for (const [clientId, subscriptions] of this.subscriptions.entries()) {
      // Empty set = subscribed to all
      const subscribedToAll = subscriptions.size === 0;
      const subscribedToType = subscriptions.has(entityType);

      if (subscribedToAll || subscribedToType) {
        clients.push(clientId);
      }
    }

    return clients;
  }

  /**
   * Get the number of registered clients
   */
  getClientCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get client subscription details (for debugging)
   */
  getClientSubscriptions(clientId: string): EntityType[] | 'all' {
    const subscriptions = this.subscriptions.get(clientId);
    if (!subscriptions) {
      return [];
    }
    return subscriptions.size === 0 ? 'all' : Array.from(subscriptions);
  }
}
