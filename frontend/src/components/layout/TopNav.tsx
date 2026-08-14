import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Command,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { CommandPalette } from './CommandPalette';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuth } from '@/context/AuthContext';

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const { documents } = useWorkspaceStore();
  const { user, logout } = useAuth();

  useCommandPalette(() => setCommandOpen((v) => !v));

  const isWorkspace = location.pathname === '/workspace';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <motion.header
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-md flex-shrink-0"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {!isWorkspace && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-[14px] font-semibold text-white">
                Dasaiko
              </span>
            </button>
          )}

          {isWorkspace && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-400">
                Research Workbench
              </span>

              <span className="text-[10px] text-zinc-700 font-mono px-2 py-0.5 bg-surface border border-white/[0.06] rounded-full">
                {documents.length} doc{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Center — search trigger */}
        {isWorkspace && (
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-surface hover:border-white/15 transition-all text-zinc-600 hover:text-zinc-400 text-[13px] min-w-[200px] max-w-xs"
          >
            <Search className="w-3.5 h-3.5" />

            <span className="flex-1 text-left">
              Search or ask...
            </span>

            <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-700">
              <Command className="w-3 h-3" />
              K
            </span>
          </button>
        )}

        {/* Right */}
        <div className="flex items-center gap-2">
          {!isWorkspace && (
            <>
              <button
                onClick={() => navigate('/workspace')}
                className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-zinc-300 hover:text-white hover:bg-hover border border-white/[0.06] hover:border-white/15 transition-all"
              >
                Open Workspace
              </button>

              <button
                onClick={() => navigate('/workspace')}
                className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-primary hover:bg-primary/90 text-white transition-colors"
              >
                Get Started
              </button>
            </>
          )}

          {isWorkspace && (
            <>
              <div
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-surface"
                title={user?.email ?? ''}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white">
                  {(
                    user?.username?.[0] ??
                    user?.email?.[0] ??
                    'U'
                  ).toUpperCase()}
                </div>

                <span className="max-w-[140px] truncate text-[12px] text-zinc-400">
                  {user?.username ?? user?.email ?? 'User'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-zinc-500 hover:text-zinc-200 hover:bg-hover hover:border-white/15 transition-all text-[12px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  Sign out
                </span>
              </button>
            </>
          )}
        </div>
      </motion.header>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </>
  );
}
