'use client';

import { useState } from 'react';
import { Settings, Server, Key, Globe } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

export default function SettingsPage() {
  const { connected } = useAppStore();
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_ANNE_API_URL || 'http://localhost:3001'
  );

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-zinc-400" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Connection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Backend Connection</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Set via NEXT_PUBLIC_ANNE_API_URL environment variable
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-zinc-300">
              {connected ? 'Connected to Anne backend' : 'Not connected'}
            </span>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Authentication</h2>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">API Secret</label>
          <input
            type="password"
            value="••••••••"
            disabled
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm opacity-50"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Set via NEXT_PUBLIC_ANNE_API_SECRET environment variable
          </p>
        </div>
      </div>

      {/* About */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">About</h2>
        </div>

        <div className="space-y-2 text-sm text-zinc-400">
          <p><span className="text-zinc-300">Anne App</span> — AI Trading Dashboard</p>
          <p>Version: 0.1.0</p>
          <p>Built with Next.js + Tauri</p>
          <p>Backend: Project Anne v0.6.0</p>
        </div>
      </div>
    </div>
  );
}
