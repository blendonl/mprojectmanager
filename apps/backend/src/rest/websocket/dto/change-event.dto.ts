import { ChangeType, EntityType } from '../../../core/events/interfaces/entity-event.interface';

/**
 * Change event DTO sent to clients
 */
export class ChangeEventDto {
  type: 'change';
  payload: {
    entityType: EntityType;
    changeType: ChangeType;
    entityId: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;

  constructor(
    entityType: EntityType,
    changeType: ChangeType,
    entityId: string,
    timestamp: Date,
    metadata?: Record<string, any>,
  ) {
    this.type = 'change';
    this.payload = {
      entityType,
      changeType,
      entityId,
      timestamp: timestamp.toISOString(),
      metadata,
    };
    this.timestamp = new Date().toISOString();
  }
}
