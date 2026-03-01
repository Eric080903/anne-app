'use client';

import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Swords,
  Loader2,
  Zap,
  Shield,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatPercent } from '@/lib/utils';
import type { ADFDecision } from '@/lib/types';

// ---------------------------------------------------------------------------
// Decision colors and labels
// ---------------------------------------------------------------------------

const DECISION_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  BUY: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    label: 'BUY',
  },
  SELL: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    label: 'SELL',
  },
  HOLD: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    label: 'HOLD',
  },
  VETOED: {
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    label: 'VETOED',
  },
};

function getDecisionStyle(action: string) {
  return DECISION_STYLES[action] ?? DECISION_STYLES.HOLD;
}

// ---------------------------------------------------------------------------
// ADF Debate Page
// ---------------------------------------------------------------------------

export default function ADFPage() {
  const [symbol, setSymbol] = useState('');

  // Full debate mutation
  const debateMutation = useMutation({
    mutationFn: (sym: string) => {
      if (!sym) throw new Error('Symbol is required');
      return api.adf.debate(sym);
    },
  });

  // Quick debate mutation
  const quickMutation = useMutation({
    mutationFn: (sym: string) => {
      if (!sym) throw new Error('Symbol is required');
      return api.adf.quick(sym);
    },
  });

  function handleDebate(e: FormEvent) {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    debateMutation.mutate(sym);
  }

  function handleQuick() {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    quickMutation.mutate(sym);
  }

  // Use whichever result is most recent
  const result: ADFDecision | undefined = debateMutation.data ?? quickMutation.data;
  const isLoading = debateMutation.isPending || quickMutation.isPending;
  const isError = debateMutation.isError || quickMutation.isError;
  const error = debateMutation.error ?? quickMutation.error;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Swords className="h-6 w-6 text-zinc-400" />
          ADF Debate
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Adversarial Debate Framework: bull and bear agents debate to reach a trading decision
        </p>
      </div>

      {/* Input form */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 max-w-xl">
        <form onSubmit={handleDebate} className="space-y-4">
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2',
                isLoading && 'opacity-60 cursor-not-allowed',
              )}
            >
              {debateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Debating...
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4" />
                  Run Debate
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleQuick}
              disabled={isLoading}
              className={cn(
                'py-2.5 px-4 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-2 border border-zinc-700',
                isLoading && 'opacity-60 cursor-not-allowed',
              )}
            >
              {quickMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Quick...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Quick Debate
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <div>
              <p className="text-sm text-white font-medium">Agents deliberating...</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                This typically takes ~5-8 seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6">
          <div className="flex items-start gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Debate failed</p>
              <p className="text-xs mt-0.5">
                {error instanceof Error ? error.message : 'An unknown error occurred.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          {/* Decision banner */}
          {(() => {
            const style = getDecisionStyle(result.action);
            return (
              <div
                className={cn(
                  'rounded-xl border p-6',
                  style.bg,
                  style.border,
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">
                      Decision for {result.symbol}
                    </span>
                    <span className={cn('text-3xl font-bold', style.text)}>
                      {style.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block mb-1">Confidence</span>
                    <span className="text-2xl font-bold text-white">
                      {formatPercent(result.confidence * 100)}
                    </span>
                  </div>
                </div>

                {/* Bull vs Bear scores */}
                <div className="mt-4 flex gap-4">
                  <div className="flex-1 rounded-lg bg-zinc-900/50 p-3">
                    <span className="text-xs text-green-400 block mb-0.5">Bull Score</span>
                    <span className="text-lg font-bold text-white">
                      {result.bullScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex-1 rounded-lg bg-zinc-900/50 p-3">
                    <span className="text-xs text-red-400 block mb-0.5">Bear Score</span>
                    <span className="text-lg font-bold text-white">
                      {result.bearScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Veto reason */}
                {result.riskAssessment.vetoed && result.riskAssessment.vetoReason && (
                  <div className="mt-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
                    <span className="text-xs text-zinc-400 block mb-0.5">Veto Reason</span>
                    <span className="text-sm text-zinc-300">
                      {result.riskAssessment.vetoReason}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Risk assessment */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-zinc-400" />
              Risk Assessment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">Max Loss</span>
                <span className="text-sm font-medium text-red-400">
                  {formatPercent(result.riskAssessment.maxLoss * 100)}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">
                  Probability of Loss
                </span>
                <span className="text-sm font-medium text-zinc-200">
                  {formatPercent(result.riskAssessment.probabilityOfLoss * 100)}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">
                  Risk/Reward Ratio
                </span>
                <span className="text-sm font-medium text-zinc-200">
                  {result.riskAssessment.riskRewardRatio.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">
                  Position Size Rec.
                </span>
                <span className="text-sm font-medium text-zinc-200">
                  {formatPercent(result.riskAssessment.positionSizeRecommendation * 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Reasoning</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>

          {/* Debate rounds (collapsible) */}
          {result.debateRounds && result.debateRounds.length > 0 && (
            <details className="rounded-xl bg-zinc-900 border border-zinc-800">
              <summary className="p-6 cursor-pointer text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                Debate Rounds ({result.debateRounds.length})
              </summary>
              <div className="px-6 pb-6 space-y-4">
                {result.debateRounds.map((round) => (
                  <div
                    key={round.round}
                    className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-400">
                        Round {round.round}
                      </span>
                      <span>
                        {round.attacker} attacks {round.target}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-red-400 font-medium">Attack:</span>
                      <p className="text-sm text-zinc-300 mt-0.5">{round.attack}</p>
                    </div>
                    <div>
                      <span className="text-xs text-green-400 font-medium">Response:</span>
                      <p className="text-sm text-zinc-300 mt-0.5">{round.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Cost and latency footer */}
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Cost: ${result.costUSD.toFixed(4)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Latency: {(result.latencyMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
