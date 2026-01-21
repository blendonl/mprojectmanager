import { getEventBus, FileChangeEventPayload } from '../../../core/EventBus';
import { IDaemonTask, DaemonTaskConfig, IChangeDetector, EntityChange, EntityType } from '../interfaces';

export interface EntityChangeWatcherTaskConfig extends DaemonTaskConfig {
  /**
   * Entity types to watch (if not specified, watches all)
   */
  entityTypes?: EntityType[];
}

const DEFAULT_CONFIG: EntityChangeWatcherTaskConfig = {
  enabled: true,
  runInBackground: false,
};

/**
 * Task that watches for entity changes from the backend
 *
 * This task uses a change detector (typically WebSocket-based) to receive
 * real-time updates about entity changes and publishes them to the event bus.
 */
export class EntityChangeWatcherTask implements IDaemonTask<EntityChange[]> {
  readonly name = 'EntityChangeWatcher';

  private config: EntityChangeWatcherTaskConfig;
  private isRunning = false;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private detector: IChangeDetector,
    config: Partial<EntityChangeWatcherTaskConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    if (!this.config.enabled) {
      console.log(`[${this.name}] Task is disabled`);
      return;
    }

    this.isRunning = true;

    // Subscribe to change events
    this.unsubscribe = this.detector.onChange((changes) => {
      this.handleChanges(changes);
    });

    // Start the detector
    try {
      await this.detector.start();
      console.log(`[${this.name}] Started`);
    } catch (error) {
      console.error(`[${this.name}] Failed to start detector:`, error);
      this.isRunning = false;
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.detector.stop();

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.isRunning = false;
    console.log(`[${this.name}] Stopped`);
  }

  async execute(): Promise<EntityChange[]> {
    // This task is event-driven, so execute doesn't do anything
    // Changes are handled via the onChange subscription
    return [];
  }

  isActive(): boolean {
    return this.isRunning && this.detector.isActive();
  }

  getConfig(): EntityChangeWatcherTaskConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<EntityChangeWatcherTaskConfig>): void {
    const wasRunning = this.isRunning;
    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...config };

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }

  reset(): void {
    this.stop();
    this.detector.reset();
  }

  private handleChanges(changes: EntityChange[]): void {
    if (changes.length === 0) {
      return;
    }

    console.log(`[${this.name}] Received ${changes.length} changes`);

    const eventBus = getEventBus();

    for (const change of changes) {
      // Map entity changes to file change events for backward compatibility
      // In the future, we might want to create entity-specific events
      const payload: FileChangeEventPayload = {
        entityType: change.entityType,
        changeType: change.changeType,
        filePath: change.id, // Use entity ID as file path for compatibility
        timestamp: change.timestamp,
      };

      eventBus.publishSync('file_changed', payload);

      // Also publish entity-specific events
      eventBus.publishSync('entity_changed', {
        id: change.id,
        entityType: change.entityType,
        changeType: change.changeType,
        timestamp: change.timestamp,
        metadata: change.metadata,
      });
    }
  }
}
