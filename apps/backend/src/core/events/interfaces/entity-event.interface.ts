export type EntityType = 'project' | 'board' | 'column' | 'task' | 'agenda' | 'agenda-item';
export type ChangeType = 'added' | 'modified' | 'deleted';

export interface EntityEvent<T = any> {
  entityType: EntityType;
  changeType: ChangeType;
  entityId: string;
  timestamp: Date;
  data?: T;
  metadata?: Record<string, any>;
}
