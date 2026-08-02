import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { commandPalette } from '@/utils/animations';
import { mockDocuments } from '@/data/mockData';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { setActiveDocument } = useWorkspaceStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const filtered = mockDocuments.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          variants={commandPalette}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className="w-full max-w-xl bg-surface border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-zinc-500 mr-3" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents or research topics..."
              aria-label="Search input"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <kbd className="text-[10px] font-mono text-zinc-600 px-1.5 py-0.5 rounded border border-white/[0.08]">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1" role="listbox">
            <p className="text-[10px] font-medium uppercase text-zinc-600 px-3 py-1.5 tracking-wider">
              Documents ({filtered.length})
            </p>
            {filtered.map((doc) => (
              <button
                key={doc.id}
                role="option"
                aria-selected={false}
                onClick={() => {
                  setActiveDocument(doc.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-hover transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" aria-hidden="true" />
                  <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                    {doc.name}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-6">No matching documents found</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
