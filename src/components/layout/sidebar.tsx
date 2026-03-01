'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  FlaskConical,
  Swords,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Chat', icon: MessageSquare, href: '/chat' },
  { label: 'Markets', icon: TrendingUp, href: '/market' },
  { label: 'Trading', icon: ArrowLeftRight, href: '/trade' },
  { label: 'Portfolio', icon: PieChart, href: '/portfolio' },
  { label: 'Backtest', icon: FlaskConical, href: '/backtest' },
  { label: 'ADF Debate', icon: Swords, href: '/adf' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, connected } = useAppStore();

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800">
        {sidebarOpen && (
          <span className="text-lg font-bold text-white tracking-tight">
            Anne
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Connection status */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full shrink-0',
              connected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          {sidebarOpen && (
            <span className="text-xs text-zinc-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
