// =============================================================================
// Anne App - HTTP API Client
// Typed fetch wrapper for the Anne backend API
// =============================================================================

import type {
  Quote,
  Bar,
  MarketNews,
  SymbolInfo,
  MarketStatus,
  ChatMessage,
  ADFDecision,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_ANNE_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.NEXT_PUBLIC_ANNE_API_SECRET || '';

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// API object
// ---------------------------------------------------------------------------

const api = {
  // -------------------------------------------------------------------------
  // Chat
  // -------------------------------------------------------------------------
  chat: {
    send(message: string): Promise<{ reply: string; messages: ChatMessage[] }> {
      return apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },

    history(): Promise<{ messages: ChatMessage[] }> {
      return apiFetch('/api/chat/history');
    },

    clear(): Promise<{ success: boolean }> {
      return apiFetch('/api/chat/clear', { method: 'POST' });
    },
  },

  // -------------------------------------------------------------------------
  // Market data
  // -------------------------------------------------------------------------
  market: {
    quote(symbol: string): Promise<Quote> {
      return apiFetch(`/api/market/quote/${encodeURIComponent(symbol)}`);
    },

    bars(
      symbol: string,
      interval: string = '1d',
      limit: number = 100,
    ): Promise<Bar[]> {
      const params = new URLSearchParams({ interval, limit: String(limit) });
      return apiFetch(
        `/api/market/bars/${encodeURIComponent(symbol)}?${params}`,
      );
    },

    news(symbol?: string): Promise<MarketNews[]> {
      if (symbol) {
        return apiFetch(
          `/api/market/news/${encodeURIComponent(symbol)}`,
        );
      }
      return apiFetch('/api/market/news');
    },

    search(q: string): Promise<SymbolInfo[]> {
      return apiFetch(
        `/api/market/search?q=${encodeURIComponent(q)}`,
      );
    },

    status(): Promise<MarketStatus[]> {
      return apiFetch('/api/market/status');
    },
  },

  // -------------------------------------------------------------------------
  // Trading
  // -------------------------------------------------------------------------
  trade: {
    positions(): Promise<{ text: string }> {
      return apiFetch('/api/trade/positions');
    },

    orders(): Promise<{ text: string }> {
      return apiFetch('/api/trade/orders');
    },

    funds(): Promise<{ text: string }> {
      return apiFetch('/api/trade/funds');
    },

    buy(
      code: string,
      qty: number,
      price?: number,
    ): Promise<{ tradeId: string; status: string }> {
      return apiFetch('/api/trade/buy', {
        method: 'POST',
        body: JSON.stringify({ code, qty, price }),
      });
    },

    sell(
      code: string,
      qty: number,
      price?: number,
    ): Promise<{ tradeId: string; status: string }> {
      return apiFetch('/api/trade/sell', {
        method: 'POST',
        body: JSON.stringify({ code, qty, price }),
      });
    },

    confirm(
      tradeId: string,
      pin: string,
    ): Promise<{ success: boolean; orderId: string }> {
      return apiFetch('/api/trade/confirm', {
        method: 'POST',
        body: JSON.stringify({ tradeId, pin }),
      });
    },
  },

  // -------------------------------------------------------------------------
  // System
  // -------------------------------------------------------------------------
  system: {
    health(): Promise<{ status: string; uptime: number }> {
      return apiFetch('/api/system/health');
    },

    budget(): Promise<{ used: number; limit: number; remaining: number }> {
      return apiFetch('/api/system/budget');
    },

    watchlist(): Promise<string[]> {
      return apiFetch('/api/system/watchlist');
    },

    addToWatchlist(symbol: string): Promise<{ success: boolean }> {
      return apiFetch('/api/system/watchlist', {
        method: 'PUT',
        body: JSON.stringify({ symbol }),
      });
    },

    removeFromWatchlist(symbol: string): Promise<{ success: boolean }> {
      return apiFetch(
        `/api/system/watchlist/${encodeURIComponent(symbol)}`,
        { method: 'DELETE' },
      );
    },

    skills(): Promise<any[]> {
      return apiFetch('/api/system/skills');
    },
  },

  // -------------------------------------------------------------------------
  // ADF (Adversarial Debate Framework)
  // -------------------------------------------------------------------------
  adf: {
    debate(symbol: string): Promise<ADFDecision> {
      return apiFetch('/api/adf/debate', {
        method: 'POST',
        body: JSON.stringify({ symbol }),
      });
    },

    quick(symbol: string): Promise<ADFDecision> {
      return apiFetch('/api/adf/quick', {
        method: 'POST',
        body: JSON.stringify({ symbol }),
      });
    },
  },

  // -------------------------------------------------------------------------
  // Backtest
  // -------------------------------------------------------------------------
  backtest: {
    run(config: {
      symbol: string;
      strategy: string;
      startDate: string;
      endDate: string;
      initialCapital?: number;
      params?: Record<string, any>;
    }): Promise<any> {
      return apiFetch('/api/backtest/run', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },
  },

  // -------------------------------------------------------------------------
  // Analysis
  // -------------------------------------------------------------------------
  analysis: {
    score(symbol: string): Promise<any> {
      return apiFetch(
        `/api/analysis/score/${encodeURIComponent(symbol)}`,
      );
    },
  },
};

export { api };
export default api;
