import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, ArrowRight } from "lucide-react";

import { commandPalette } from "@/utils/animations";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    documents,
    setActiveDocument,
  } = useWorkspaceStore();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(query.toLowerCase())
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
          className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-surface shadow-2xl"
        >
          <div className="flex items-center border-b border-white/[0.06] px-4 py-3">
            <Search
              className="mr-3 h-4 w-4 text-zinc-500"
              aria-hidden="true"
            />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              aria-label="Search documents"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />

            <kbd className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
              ESC
            </kbd>
          </div>

          <div
            className="max-h-80 overflow-y-auto p-2"
            role="listbox"
          >
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Documents ({filtered.length})
            </p>

            {filtered.length > 0 ? (
              filtered.map((doc) => (
                <button
                  key={doc.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setActiveDocument(doc.id);
                    onClose();
                  }}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-hover"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText
                      className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />

                    <span className="truncate text-xs text-zinc-300 group-hover:text-white">
                      {doc.name}
                    </span>
                  </div>

                  <ArrowRight
                    className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-zinc-600"
                    aria-hidden="true"
                  />
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-zinc-600">
                No matching documents found.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}