import { WebSocketClient } from '../websocket/WebSocketClient';
import { IChangeDetector, EntityChange, EntityType, ChangeType } from './interfaces';

export { EntityChange, EntityType, ChangeType };

interface BackendChangeMessage {
  entityType: EntityType;
  changeType: ChangeType;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BackendChangeDetectorOptions {
  /**
   * Entity types to subscribe to (if not specified, subscribes to all)
   */
  entityTypes?: EntityType[];

  /**
   * WebSocket path (default: /ws/changes)
   */
  wsPath?: string;

  /**
   * Whether to auto-reconnect on disconnect
   */
  autoReconnect?: boolean;
}

/**
 * Backend change detector using WebSocket for real-time updates
 *
 * This detector connects to the backend via WebSocket and receives
 * real-time change notifications for entities like agenda, boards, tasks, etc.
 *
 * Usage:
 * ```ts
 * const detector = new BackendChangeDetector({ entityTypes: ['agenda'] });
 * detector.onChange((changes) => {
 *   console.log('Detected changes:', changes);
 * });
 * await detector.start();
 * ```
 */
export class BackendChangeDetector implements IChangeDetector {
  private wsClient: WebSocketClient;
  private changeHandlers: Set<(changes: EntityChange[]) => void> = new Set();
  private options: Required<BackendChangeDetectorOptions>;
  private active = false;
  private unsubscribeWs: (() => void) | null = null;

  constructor(options: BackendChangeDetectorOptions = {}) {
    this.options = {
      entityTypes: options.entityTypes || [],
      wsPath: options.wsPath || '/ws/changes',
      autoReconnect: options.autoReconnect !== undefined ? options.autoReconnect : true,
    };

    this.wsClient = new WebSocketClient(this.options.wsPath, {
      autoReconnect: this.options.autoReconnect,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
    });
  }

  async start(): Promise<void> {
    if (this.active) {
      console.log('[BackendChangeDetector] Already active');
      return;
    }

    console.log('[BackendChangeDetector] Starting change detection');
    this.active = true;

    // Subscribe to change messages
    this.unsubscribeWs = this.wsClient.on<BackendChangeMessage>('change', (message) => {
      this.handleChangeMessage(message);
    });

    // Connect to WebSocket
    this.wsClient.connect();

    // Wait for connection (or timeout)
    await this.waitForConnection(5000);

    // Subscribe to specific entity types if specified
    if (this.options.entityTypes.length > 0) {
      this.subscribeToEntityTypes(this.options.entityTypes);
    }

    console.log('[BackendChangeDetector] Started');
  }

  stop(): void {
    if (!this.active) {
      return;
    }

    console.log('[BackendChangeDetector] Stopping change detection');
    this.active = false;

    // Unsubscribe from WebSocket messages
    if (this.unsubscribeWs) {
      this.unsubscribeWs();
      this.unsubscribeWs = null;
    }

    // Disconnect WebSocket
    this.wsClient.disconnect();

    console.log('[BackendChangeDetector] Stopped');
  }

  onChange(handler: (changes: EntityChange[]) => void): () => void {
    this.changeHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.changeHandlers.delete(handler);
    };
  }

  reset(): void {
    console.log('[BackendChangeDetector] Resetting');
    this.stop();
    this.changeHandlers.clear();
  }

  isActive(): boolean {
    return this.active && this.wsClient.isConnected();
  }

  /**
   * Subscribe to specific entity types
   */
  subscribeToEntityTypes(entityTypes: EntityType[]): void {
    if (!this.wsClient.isConnected()) {
      console.warn('[BackendChangeDetector] Cannot subscribe, not connected');
      return;
    }

    this.wsClient.send('subscribe', { entityTypes });
    console.log(`[BackendChangeDetector] Subscribed to entity types: ${entityTypes.join(', ')}`);
  }

  /**
   * Unsubscribe from specific entity types
   */
  unsubscribeFromEntityTypes(entityTypes: EntityType[]): void {
    if (!this.wsClient.isConnected()) {
      console.warn('[BackendChangeDetector] Cannot unsubscribe, not connected');
      return;
    }

    this.wsClient.send('unsubscribe', { entityTypes });
    console.log(`[BackendChangeDetector] Unsubscribed from entity types: ${entityTypes.join(', ')}`);
  }

  private handleChangeMessage(message: BackendChangeMessage): void {
    // Filter by entity type if specified
    if (this.options.entityTypes.length > 0 && !this.options.entityTypes.includes(message.entityType)) {
      return;
    }

    const change: EntityChange = {
      id: message.entityId,
      entityType: message.entityType,
      changeType: message.changeType,
      timestamp: new Date(message.timestamp),
      metadata: message.metadata,
    };

    console.log('[BackendChangeDetector] Change detected:', change);

    // Notify all handlers
    this.changeHandlers.forEach(handler => {
      try {
        handler([change]);
      } catch (error) {
        console.error('[BackendChangeDetector] Error in change handler:', error);
      }
    });
  }

  private async waitForConnection(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.wsClient.isConnected()) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error('Connection timeout'));
      }, timeoutMs);

      const unsubscribe = this.wsClient.onEvent('connected', () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      });
    });
  }
}
