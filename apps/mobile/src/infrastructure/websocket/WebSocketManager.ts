import { WebSocketClient, WebSocketOptions } from './WebSocketClient';

/**
 * Manages multiple WebSocket connections
 *
 * This manager allows the application to maintain multiple WebSocket
 * connections to different endpoints (e.g., agenda updates, board changes, etc.)
 * while providing a centralized API for managing them.
 */
export class WebSocketManager {
  private connections: Map<string, WebSocketClient> = new Map();

  /**
   * Create or get a WebSocket connection
   */
  getConnection(name: string, path: string, options?: WebSocketOptions): WebSocketClient {
    if (this.connections.has(name)) {
      return this.connections.get(name)!;
    }

    const client = new WebSocketClient(path, options);
    this.connections.set(name, client);
    return client;
  }

  /**
   * Connect a specific connection by name
   */
  connect(name: string): void {
    const client = this.connections.get(name);
    if (client) {
      client.connect();
    } else {
      console.warn(`[WebSocketManager] Connection "${name}" not found`);
    }
  }

  /**
   * Disconnect a specific connection by name
   */
  disconnect(name: string): void {
    const client = this.connections.get(name);
    if (client) {
      client.disconnect();
    }
  }

  /**
   * Connect all registered connections
   */
  connectAll(): void {
    console.log('[WebSocketManager] Connecting all connections');
    this.connections.forEach((client, name) => {
      console.log(`[WebSocketManager] Connecting ${name}`);
      client.connect();
    });
  }

  /**
   * Disconnect all connections
   */
  disconnectAll(): void {
    console.log('[WebSocketManager] Disconnecting all connections');
    this.connections.forEach((client, name) => {
      console.log(`[WebSocketManager] Disconnecting ${name}`);
      client.disconnect();
    });
  }

  /**
   * Remove a connection
   */
  removeConnection(name: string): void {
    const client = this.connections.get(name);
    if (client) {
      client.disconnect();
      this.connections.delete(name);
    }
  }

  /**
   * Check if a connection exists
   */
  hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  /**
   * Get all connection names
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }
}
