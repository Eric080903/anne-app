'use client';

import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FlaskConical, Loader2, Play, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Strategy options
// ---------------------------------------------------------------------------

const STRATEGIES = [
  { value: 'sma_crossover', label: 'SMA Crossover' },
  { value: 'rsi_mean_reversion', label: 'RSI Mean Reversion' },
  { value: 'momentum', label: 'Momentum' },
] as const;

// ---------------------------------------------------------------------------
// Backtest Page
// ---------------------------------------------------------------------------

export default function BacktestPage() {
  const [symbol, setSymbol] = useState('');
  const [strategy, setStrategy] = useState<string>(STRATEGIES[0].value);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-01-01');

  // Backtest mutation
  const backtestMutation = useMutation({
    mutationFn: () => {
      const sym = symbol.trim().toUpperCase();
      if (!sym) throw new Error('Symbol is required');

      return api.backtest.run({
        symbol: sym,
        strategy,
        startDate,
        endDate,
      });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    backtestMutation.mutate();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-zinc-400" />
          Backtest
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Test trading strategies against historical data
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 max-w-xl">
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

          {/* Strategy */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors appearance-none"
            >
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={backtestMutation.isPending}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2',
              backtestMutation.isPending && 'opacity-60 cursor-not-allowed',
            )}
          >
            {backtestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Backtest
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results area */}
      {backtestMutation.isPending && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <div>
              <p className="text-sm text-white font-medium">Running backtest...</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Testing {strategy.replace(/_/g, ' ')} on {symbol.trim().toUpperCase() || '...'} from{' '}
                {startDate} to {endDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {backtestMutation.isError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6">
          <div className="flex items-start gap-2 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Backtest failed</p>
              <p className="text-xs mt-0.5">
                {backtestMutation.error instanceof Error
                  ? backtestMutation.error.message
                  : 'An unknown error occurred.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {backtestMutation.isSuccess && backtestMutation.data && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 overflow-x-auto">
            {typeof backtestMutation.data === 'string'
              ? backtestMutation.data
              : JSON.stringify(backtestMutation.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
