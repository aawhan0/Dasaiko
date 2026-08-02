import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Settings as SettingsIcon, Server, Database, Moon, Info } from 'lucide-react';
import { defaultSettings } from '@/data/mockData';

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(defaultSettings.apiBaseUrl);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
          <p className="text-xs text-zinc-500">Manage API connections, storage, and application preferences.</p>
        </div>

        {/* API Backend Config */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-4">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-white">FastAPI Backend Connection</h2>
              <p className="text-xs text-zinc-500">Configure your local or production FastAPI base URL.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400">Endpoint URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-base border border-white/[0.10] rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Storage */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-secondary" />
            <div>
              <h2 className="text-sm font-semibold text-white">Document Storage</h2>
              <p className="text-xs text-zinc-500">All uploaded documents are processed client-side and sent directly to FastAPI.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
