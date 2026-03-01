'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{title}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div
        className={cn(
          'text-2xl font-bold',
          trend === 'up' && 'text-green-400',
          trend === 'down' && 'text-red-400',
          !trend || trend === 'neutral' ? 'text-white' : ''
        )}
      >
        {value}
      </div>
      {subtitle && (
        <span className="text-xs text-zinc-500 mt-1 block">{subtitle}</span>
      )}
    </div>
  );
}
