import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, BookOpen, Command, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommandPalette } from '@/hooks/useCommandPalette';
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

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

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
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-[14px] font-semibold text-white">Dasaiko</span>
            </button>
          )}
          {isWorkspace && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-400">Research Workbench</span>
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
            <span className="flex-1 text-left">Search or ask...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-700">
              <Command className="w-3 h-3" />K
            </span>
          </button>
        )}

        {/* Right */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-[11px] font-medium text-zinc-300">
                  {user.username}
                </div>
                <div className="text-[9px] text-zinc-600">
                  {user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-zinc-500 transition hover:border-red-400/20 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.header>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
