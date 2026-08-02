import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Server, Database, Shield } from "lucide-react";

const DEFAULT_API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  return (
    <AppShell>
      <div className="mx-auto flex-1 max-w-3xl space-y-8 overflow-y-auto p-8">
        {/* Header */}
        <div>
          <h1 className="mb-1 text-xl font-bold text-white">
            Settings
          </h1>

          <p className="text-xs text-zinc-500">
            Configure your Dasaiko frontend and backend connection.
          </p>
        </div>

        {/* Backend */}
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-primary" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                FastAPI Backend
              </h2>

              <p className="text-xs text-zinc-500">
                Base URL used by the frontend to communicate with the API.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-zinc-400">
              API Base URL
            </label>

            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full rounded-xl border border-white/[0.10] bg-base px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-primary/50"
            />

            <p className="text-[11px] text-zinc-600">
              Default value comes from{" "}
              <span className="font-mono">
                VITE_API_BASE_URL
              </span>
              .
            </p>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-secondary" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Document Storage
              </h2>

              <p className="text-xs text-zinc-500">
                Uploaded documents are stored by your FastAPI backend and
                indexed for hybrid retrieval.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-400" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Privacy
              </h2>

              <p className="text-xs text-zinc-500">
                All requests are sent only to your configured FastAPI backend.
                No external services are contacted directly by the frontend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}