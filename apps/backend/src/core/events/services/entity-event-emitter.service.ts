import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityEvent, EntityType, ChangeType } from '../interfaces/entity-event.interface';

@Injectable()
export class EntityEventEmitter {
  private readonly logger = new Logger(EntityEventEmitter.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Emit an entity change event
   * Event pattern: {entityType}.{changeType}
   * Example: 'task.added', 'board.modified', 'project.deleted'
   */
  emit<T = any>(event: EntityEvent<T>): void {
    try {
      const eventPattern = `${event.entityType}.${event.changeType}`;
      this.logger.debug(`Emitting event: ${eventPattern} for ${event.entityId}`);
      this.eventEmitter.emit(eventPattern, event);
    } catch (error) {
      this.logger.error(`Failed to emit event for ${event.entityType}:${event.entityId}`, error);
    }
  }

  /**
   * Subscribe to entity events using pattern matching
   * Patterns:
   * - '*.*' - all entity events
   * - 'task.*' - all task events
   * - '*.added' - all added events
   * - 'task.added' - specific event type
   */
  on(pattern: string, listener: (event: EntityEvent) => void): void {
    this.eventEmitter.on(pattern, listener);
  }

  /**
   * Unsubscribe from entity events
   */
  off(pattern: string, listener: (event: EntityEvent) => void): void {
    this.eventEmitter.off(pattern, listener);
  }

  /**
   * Helper method to create an entity event
   */
  createEvent<T = any>(
    entityType: EntityType,
    changeType: ChangeType,
    entityId: string,
    data?: T,
    metadata?: Record<string, any>,
  ): EntityEvent<T> {
    return {
      entityType,
      changeType,
      entityId,
      timestamp: new Date(),
      data,
      metadata,
    };
  }
}
