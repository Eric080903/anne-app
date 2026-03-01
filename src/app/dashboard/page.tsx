'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Eye,
  Globe,
  HeartPulse,
  Wallet,
  Zap,
  MessageSquare,
  BarChart3,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { StatCard } from '@/components/shared/stat-card';
import type { MarketStatus } from '@/lib/types';

// =============================================================================
// Watchlist Card
// =============================================================================

function WatchlistCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.system.watchlist(),
    refetchInterval: 15_000,
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-300">Watchlist</h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400">Failed to load watchlist</p>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-zinc-500">No symbols in watchlist</p>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((symbol) => (
            <li
              key={symbol}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <Link
                href={`/market?symbol=${encodeURIComponent(symbol)}`}
                className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                {symbol}
              </Link>
              <span className="text-xs text-zinc-500">View</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// Market Status Card
// =============================================================================

function MarketStatusCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['market-status'],
    queryFn: () => api.market.status(),
    refetchInterval: 60_000,
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-300">Market Status</h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400">Failed to load market status</p>
      )}

      {data && (
        <ul className="space-y-2">
          {data.map((market: MarketStatus) => (
            <li
              key={market.market}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {market.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {market.market} &middot; {market.currency}
                </span>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  market.isOpen
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {market.isOpen ? 'Open' : 'Closed'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// Health Card
// =============================================================================

function HealthCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.system.health(),
    refetchInterval: 30_000,
  });

  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-300">System Health</h2>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 bg-zinc-800 rounded animate-pulse" />
          <div className="h-10 bg-zinc-800 rounded animate-pulse" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400">Backend unreachable</p>
      )}

      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Status</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                data.status === 'ok'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              )}
            >
              {data.status === 'ok' ? 'Healthy' : data.status}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Uptime</span>
            <span className="text-sm font-medium text-white">
              {formatUptime(data.uptime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Budget Card
// =============================================================================

function BudgetCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['budget'],
    queryFn: () => api.system.budget(),
    refetchInterval: 60_000,
  });

  const usedPercent = data ? Math.round((data.used / data.limit) * 100) : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-300">API Budget</h2>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400">Failed to load budget</p>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="Used"
              value={`$${data.used.toFixed(2)}`}
              trend={usedPercent > 80 ? 'down' : 'neutral'}
            />
            <StatCard
              title="Limit"
              value={`$${data.limit.toFixed(2)}`}
            />
            <StatCard
              title="Remaining"
              value={`$${data.remaining.toFixed(2)}`}
              trend={data.remaining > 0 ? 'up' : 'down'}
            />
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{usedPercent}% used</span>
              <span>${data.remaining.toFixed(2)} left</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  usedPercent > 90
                    ? 'bg-red-500'
                    : usedPercent > 70
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Quick Actions Card
// =============================================================================

function QuickActionsCard() {
  const actions = [
    {
      label: 'Daily Report',
      icon: FileText,
      href: '/chat?prompt=daily+report',
      color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
    },
    {
      label: 'Chat with Anne',
      icon: MessageSquare,
      href: '/chat',
      color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
    },
    {
      label: 'Market Overview',
      icon: BarChart3,
      href: '/market',
      color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20',
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-300">Quick Actions</h2>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              action.color
            )}
          >
            <action.icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Dashboard Page
// =============================================================================

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Overview of your trading system
        </p>
      </div>

      {/* Row 1: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WatchlistCard />
        <MarketStatusCard />
        <HealthCard />
      </div>

      {/* Row 2: 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BudgetCard />
        <QuickActionsCard />
      </div>
    </div>
  );
}
