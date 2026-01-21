import { API_BASE_URL } from "../../core/config/ApiConfig";

export type WebSocketEventType = 'connected' | 'disconnected' | 'message' | 'error';

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

export type WebSocketEventHandler<T = any> = (data: T) => void;

export interface WebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const DEFAULT_OPTIONS: Required<WebSocketOptions> = {
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
};

/**
 * WebSocket client for real-time communication with the backend
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Event-based message handling
 * - Connection state management
 * - Type-safe message handling
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private messageHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();

  constructor(path: string, options: WebSocketOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Convert HTTP(S) URL to WS(S)
    const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
    this.url = `${baseUrl}${path}`;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocketClient] Already connected or connecting');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      console.log(`[WebSocketClient] Connecting to ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocketClient] Connected');
        this.reconnectAttempts = 0;
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('[WebSocketClient] Message received:', message.type);

          // Emit to generic message handlers
          this.emit('message', message);

          // Emit to specific message type handlers
          const handlers = this.messageHandlers.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.payload));
          }
        } catch (error) {
          console.error('[WebSocketClient] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketClient] Error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocketClient] Disconnected');
        this.emit('disconnected', null);

        if (!this.isIntentionallyClosed && this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocketClient] Failed to connect:', error);
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocketClient] Disconnected intentionally');
  }

  /**
   * Send a message to the server
   */
  send<T = any>(type: string, payload: T): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketClient] Cannot send message, not connected');
      return;
    }

    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to a specific message type
   */
  on<T = any>(messageType: string, handler: WebSocketEventHandler<T>): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }
    };
  }

  /**
   * Subscribe to WebSocket events (connected, disconnected, message, error)
   */
  onEvent<T = any>(eventType: WebSocketEventType, handler: WebSocketEventHandler<T>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private emit<T>(eventType: WebSocketEventType, data: T): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}
