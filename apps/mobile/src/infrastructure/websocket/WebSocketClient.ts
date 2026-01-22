import { io, Socket } from 'socket.io-client';
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
  private socket: Socket | null = null;
  private path: string;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private isIntentionallyClosed = false;
  private messageHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();

  constructor(path: string, options: WebSocketOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.path = path;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[WebSocketClient] Already connected');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      console.log(`[WebSocketClient] Connecting to ${API_BASE_URL}${this.path}`);

      this.socket = io(API_BASE_URL, {
        path: this.path,
        transports: ['websocket', 'polling'],
        reconnection: false,
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocketClient] Connected');
        this.reconnectAttempts = 0;
        this.registerMessageHandlers();
        this.emit('connected', null);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocketClient] Disconnected:', reason);
        this.emit('disconnected', null);

        if (!this.isIntentionallyClosed && this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocketClient] Error:', error);
        this.emit('error', error);

        if (!this.isIntentionallyClosed && this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      });

      this.socket.connect();
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

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('[WebSocketClient] Disconnected intentionally');
  }

  /**
   * Send a message to the server
   */
  send<T = any>(type: string, payload: T): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocketClient] Cannot send message, not connected');
      return;
    }

    this.socket.emit(type, payload);
  }

  /**
   * Subscribe to a specific message type
   */
  on<T = any>(messageType: string, handler: WebSocketEventHandler<T>): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)!.add(handler);

    if (this.socket) {
      this.socket.on(messageType, handler);
    }

    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }

      if (this.socket) {
        this.socket.off(messageType, handler);
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
    return this.socket?.connected ?? false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval;

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect();
      }
    }, delay);
  }

  private registerMessageHandlers(): void {
    if (!this.socket) return;

    this.messageHandlers.forEach((handlers, messageType) => {
      handlers.forEach(handler => {
        this.socket!.on(messageType, handler);
      });
    });
  }

  private emit<T>(eventType: WebSocketEventType, data: T): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}
