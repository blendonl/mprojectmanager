export type EntityType = 'agenda' | 'board' | 'task' | 'project' | 'note';
export type ChangeType = 'added' | 'modified' | 'deleted';

export interface EntityState {
  id: string;
  entityType: EntityType;
  modifiedTime: number;
  metadata?: Record<string, any>;
}

export interface EntityChange {
  id: string;
  entityType: EntityType;
  changeType: ChangeType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Change detector interface for backend entity changes
 * Can be implemented for WebSocket-based or polling-based detection
 */
export interface IChangeDetector {
  /**
   * Start detecting changes
   */
  start(): Promise<void>;

  /**
   * Stop detecting changes
   */
  stop(): void;

  /**
   * Subscribe to change events
   * @returns unsubscribe function
   */
  onChange(handler: (changes: EntityChange[]) => void): () => void;

  /**
   * Reset the detector state
   */
  reset(): void;

  /**
   * Check if the detector is active
   */
  isActive(): boolean;
}
