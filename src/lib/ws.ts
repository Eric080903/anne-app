// =============================================================================
// Anne App - WebSocket Client
// Singleton with auto-reconnect and typed event handling
// =============================================================================

import type { WSEventType, WSMessage } from './types';

const WS_BASE = process.env.NEXT_PUBLIC_ANNE_WS_URL || 'ws://localhost:3001';
const API_SECRET = process.env.NEXT_PUBLIC_ANNE_API_SECRET || '';

type WSCallback = (data: any) => void;

class AnneWebSocket {
  private ws: WebSocket | null = null;
  private listeners = new Map<WSEventType, Set<WSCallback>>();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30_000; // 30 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;

  // ---------------------------------------------------------------------------
  // Connection management
  // ---------------------------------------------------------------------------

  connect(): void {
    // Guard against SSR - WebSocket only runs in the browser
    if (typeof window === 'undefined') return;

    // Don't open a new connection if one is already active
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionallyClosed = false;

    const url = API_SECRET
      ? `${WS_BASE}/ws?token=${encodeURIComponent(API_SECRET)}`
      : `${WS_BASE}/ws`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: Date.now() });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        this.emit(msg.type, msg.data);
      } catch {
        // If the message isn't valid JSON, emit as a raw error
        this.emit('error', { message: 'Invalid message format', raw: event.data });
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // The onerror event is always followed by onclose, which handles reconnect.
      // We just surface the error to listeners.
      this.emit('error', { message: 'WebSocket error' });
    };
  }

  disconnect(): void {
    this.intentionallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Reconnect with exponential backoff
  // ---------------------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.intentionallyClosed) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  // ---------------------------------------------------------------------------
  // Event emitter
  // ---------------------------------------------------------------------------

  on(event: WSEventType, callback: WSCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: WSEventType, callback: WSCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: WSEventType, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[AnneWS] listener error on "${event}":`, err);
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------

  send(type: string, data: any = {}): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[AnneWS] Cannot send - socket not open');
      return;
    }

    this.ws.send(
      JSON.stringify({ type, data, timestamp: Date.now() }),
    );
  }

  // ---------------------------------------------------------------------------
  // Status helpers
  // ---------------------------------------------------------------------------

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export a singleton instance
export const anneWS = new AnneWebSocket();
export default anneWS;
