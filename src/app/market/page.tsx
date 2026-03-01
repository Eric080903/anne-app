'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Globe, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { MarketStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Popular symbols for quick access
// ---------------------------------------------------------------------------

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple', market: 'US' },
  { symbol: 'MSFT', name: 'Microsoft', market: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet', market: 'US' },
  { symbol: 'TSLA', name: 'Tesla', market: 'US' },
  { symbol: 'AMZN', name: 'Amazon', market: 'US' },
  { symbol: '00700.HK', name: 'Tencent', market: 'HK' },
  { symbol: 'BTC-USD', name: 'Bitcoin', market: 'CRYPTO' },
] as const;

// ---------------------------------------------------------------------------
// Market status indicator colors
// ---------------------------------------------------------------------------

function statusColor(isOpen: boolean) {
  return isOpen ? 'bg-green-500' : 'bg-zinc-600';
}

function statusLabel(isOpen: boolean) {
  return isOpen ? 'Open' : 'Closed';
}

// ---------------------------------------------------------------------------
// Market Overview Page
// ---------------------------------------------------------------------------

export default function MarketPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch market status
  const { data: statuses, isLoading: statusLoading } = useQuery<MarketStatus[]>({
    queryKey: ['market', 'status'],
    queryFn: () => api.market.status(),
    refetchInterval: 60_000,
  });

  // Handle search submit
  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim().toUpperCase();
    if (trimmed) {
      router.push(`/market/${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Markets</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Search for a symbol or browse popular instruments
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter symbol (e.g. AAPL, 00700.HK, BTC-USD)..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Go
        </button>
      </form>

      {/* Market status section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-zinc-400" />
          Market Status
        </h2>

        {statusLoading ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading status...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(statuses ?? []).map((s) => (
              <div
                key={s.market}
                className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{s.name}</span>
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      statusColor(s.isOpen),
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{s.market}</span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      s.isOpen ? 'text-green-400' : 'text-zinc-500',
                    )}
                  >
                    {statusLabel(s.isOpen)}
                  </span>
                </div>
                <span className="text-xs text-zinc-600 mt-1 block">{s.currency}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular symbols section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Popular Symbols</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {POPULAR_SYMBOLS.map((item) => (
            <Link
              key={item.symbol}
              href={`/market/${encodeURIComponent(item.symbol)}`}
              className="group rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-blue-500/40 hover:bg-zinc-800/60 transition-colors"
            >
              <div className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                {item.symbol}
              </div>
              <div className="text-sm text-zinc-500 mt-0.5">{item.name}</div>
              <div className="mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {item.market}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
