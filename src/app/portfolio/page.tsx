'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PieChart, Wallet, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const positions = useQuery({
    queryKey: ['positions'],
    queryFn: () => api.trade.positions(),
    refetchInterval: 30000,
  });

  const funds = useQuery({
    queryKey: ['funds'],
    queryFn: () => api.trade.funds(),
    refetchInterval: 30000,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">Portfolio</h1>
        </div>
        <button
          onClick={() => {
            positions.refetch();
            funds.refetch();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Account Funds</h2>
          </div>
          {funds.isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ) : funds.error ? (
            <p className="text-red-400 text-sm">Failed to load funds</p>
          ) : (
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
              {funds.data?.text || 'No data'}
            </pre>
          )}
        </div>

        {/* Positions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Positions</h2>
          </div>
          {positions.isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
              <div className="h-4 bg-zinc-800 rounded w-2/3" />
            </div>
          ) : positions.error ? (
            <p className="text-red-400 text-sm">Failed to load positions</p>
          ) : (
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
              {positions.data?.text || 'No positions'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
