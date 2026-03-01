'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

export function Header() {
  const { connected } = useAppStore();

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-zinc-900 border-b border-zinc-800">
      {/* Logo / title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-white tracking-tight">Anne</h1>
        <span className="text-xs text-zinc-500 font-medium">Trading AI</span>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search symbol... (⌘K)"
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
        />
      </div>

      {/* Connection status */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          connected
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            connected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        {connected ? 'Connected' : 'Disconnected'}
      </div>
    </header>
  );
}
