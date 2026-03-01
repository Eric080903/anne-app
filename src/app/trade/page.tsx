'use client';

import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Briefcase,
  ClipboardList,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Trading Page
// ---------------------------------------------------------------------------

export default function TradePage() {
  const queryClient = useQueryClient();

  // Order form state
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Positions query
  const {
    data: positions,
    isLoading: positionsLoading,
    refetch: refetchPositions,
  } = useQuery({
    queryKey: ['trade', 'positions'],
    queryFn: () => api.trade.positions(),
  });

  // Orders query
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['trade', 'orders'],
    queryFn: () => api.trade.orders(),
  });

  // Submit order mutation
  const orderMutation = useMutation({
    mutationFn: async () => {
      const code = symbol.trim().toUpperCase();
      const quantity = Number(qty);
      const limitPrice = price ? Number(price) : undefined;

      if (!code) throw new Error('Symbol is required');
      if (!quantity || quantity <= 0) throw new Error('Quantity must be positive');

      if (side === 'buy') {
        return api.trade.buy(code, quantity, limitPrice);
      } else {
        return api.trade.sell(code, quantity, limitPrice);
      }
    },
    onSuccess: (data) => {
      setStatusMessage({
        type: 'success',
        text: `Order submitted: ${side.toUpperCase()} - Trade ID: ${data.tradeId}, Status: ${data.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
    },
    onError: (err: Error) => {
      setStatusMessage({
        type: 'error',
        text: `Order failed: ${err.message}`,
      });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    orderMutation.mutate();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-zinc-400" />
          Trading
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Place orders and manage your positions
        </p>
      </div>

      {/* Main layout: Order form + Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order form (left panel) */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Symbol */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. AAPL"
                className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
              />
            </div>

            {/* Buy / Sell toggle */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Side</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSide('buy')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    side === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700',
                  )}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSide('sell')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    side === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700',
                  )}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Quantity</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Price{' '}
                <span className="text-zinc-600">(leave blank for market order)</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Market"
                min="0"
                step="0.01"
                className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={orderMutation.isPending}
              className={cn(
                'w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                side === 'buy'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white',
                orderMutation.isPending && 'opacity-60 cursor-not-allowed',
              )}
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit {side === 'buy' ? 'Buy' : 'Sell'} Order</>
              )}
            </button>
          </form>

          {/* Status message */}
          {statusMessage && (
            <div
              className={cn(
                'mt-4 p-3 rounded-lg text-sm flex items-start gap-2',
                statusMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20',
              )}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Positions panel (right panel) */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-zinc-400" />
              Positions
            </h2>
            <button
              onClick={() => refetchPositions()}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Refresh positions"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {positionsLoading ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading positions...
            </div>
          ) : (
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
              {positions?.text || 'No open positions.'}
            </pre>
          )}
        </div>
      </div>

      {/* Orders panel (below) */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-zinc-400" />
            Orders
          </h2>
          <button
            onClick={() => refetchOrders()}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {ordersLoading ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading orders...
          </div>
        ) : (
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
            {orders?.text || 'No orders found.'}
          </pre>
        )}
      </div>
    </div>
  );
}
