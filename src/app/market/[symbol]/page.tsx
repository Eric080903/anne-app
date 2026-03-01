'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Loader2,
  Newspaper,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatPrice, formatChange, formatVolume, timeAgo } from '@/lib/utils';
import { PriceChart } from '@/components/market/price-chart';
import type { Quote, MarketNews } from '@/lib/types';

// ---------------------------------------------------------------------------
// Symbol Detail Page
// ---------------------------------------------------------------------------

export default function SymbolPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const decodedSymbol = decodeURIComponent(symbol);

  // Fetch quote data (refetch every 10s)
  const {
    data: quote,
    isLoading: quoteLoading,
    isError: quoteError,
  } = useQuery<Quote>({
    queryKey: ['market', 'quote', decodedSymbol],
    queryFn: () => api.market.quote(decodedSymbol),
    refetchInterval: 10_000,
    enabled: !!decodedSymbol,
  });

  // Fetch news
  const { data: news, isLoading: newsLoading } = useQuery<MarketNews[]>({
    queryKey: ['market', 'news', decodedSymbol],
    queryFn: () => api.market.news(decodedSymbol),
    enabled: !!decodedSymbol,
  });

  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/market"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      {/* Quote header */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        {quoteLoading ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading quote...
          </div>
        ) : quoteError ? (
          <div className="text-red-400 text-sm">
            Failed to load quote for {decodedSymbol}. Please check the symbol and try again.
          </div>
        ) : quote ? (
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Symbol and price */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{quote.symbol}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {quote.market}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(quote.price, quote.currency)}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 text-lg font-medium',
                    isPositive ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {formatChange(quote.change, quote.changePct)}
                </span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatItem label="Open" value={formatPrice(quote.open, quote.currency)} />
              <StatItem label="High" value={formatPrice(quote.high, quote.currency)} />
              <StatItem label="Low" value={formatPrice(quote.low, quote.currency)} />
              <StatItem label="Volume" value={formatVolume(quote.volume)} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Price chart */}
      <PriceChart symbol={decodedSymbol} />

      {/* News feed */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-zinc-400" />
          Recent News
        </h2>

        {newsLoading ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading news...
          </div>
        ) : !news || news.length === 0 ? (
          <p className="text-sm text-zinc-500">No recent news found for {decodedSymbol}.</p>
        ) : (
          <div className="space-y-3">
            {news.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                      <span>{item.source}</span>
                      <span>{timeAgo(item.publishedAt)}</span>
                      {item.sentiment !== undefined && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-xs font-medium',
                            item.sentiment > 0.2
                              ? 'bg-green-500/10 text-green-400'
                              : item.sentiment < -0.2
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-zinc-800 text-zinc-400',
                          )}
                        >
                          {item.sentiment > 0.2
                            ? 'Positive'
                            : item.sentiment < -0.2
                              ? 'Negative'
                              : 'Neutral'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat item helper
// ---------------------------------------------------------------------------

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-zinc-500 block">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}
