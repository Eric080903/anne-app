// =============================================================================
// Anne App - TypeScript Types
// Mirrored from the Anne backend API
// =============================================================================

// ---------------------------------------------------------------------------
// Market types
// ---------------------------------------------------------------------------

export interface Quote {
  symbol: string;
  market: 'US' | 'HK' | 'AU' | 'CRYPTO';
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: string;
  currency: string;
}

export interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover?: number;
}

export interface MarketNews {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  symbols?: string[];
  sentiment?: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'index' | 'crypto' | 'option' | 'future';
  currency: string;
  exchange: string;
}

export type MarketId = 'US' | 'HK' | 'AU' | 'CRYPTO';

export interface MarketStatus {
  market: MarketId;
  name: string;
  isOpen: boolean;
  currency: string;
}

// ---------------------------------------------------------------------------
// Chat types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// ADF (Adversarial Debate Framework) types
// ---------------------------------------------------------------------------

export interface ADFDecision {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'VETOED';
  confidence: number;
  bullScore: number;
  bearScore: number;
  riskAssessment: {
    maxLoss: number;
    probabilityOfLoss: number;
    riskRewardRatio: number;
    positionSizeRecommendation: number;
    vetoed: boolean;
    vetoReason?: string;
  };
  debateRounds: Array<{
    round: number;
    attacker: string;
    target: string;
    attack: string;
    response: string;
  }>;
  reasoning: string;
  costUSD: number;
  latencyMs: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// WebSocket event types
// ---------------------------------------------------------------------------

export type WSEventType =
  | 'connected'
  | 'agent:thinking'
  | 'agent:response'
  | 'agent:error'
  | 'market:alert'
  | 'system:shutdown'
  | 'error';

export interface WSMessage {
  type: WSEventType;
  data: any;
  timestamp: number;
}
