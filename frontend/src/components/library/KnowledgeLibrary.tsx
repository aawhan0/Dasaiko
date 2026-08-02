import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, FolderOpen } from 'lucide-react';
import { staggerContainer, staggerItem, fadeIn } from '@/utils/animations';
import { DocumentCard } from './DocumentCard';
import { SearchBar } from './SearchBar';
import { CollectionTag } from './CollectionTag';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { mockCollections } from '@/data/mockData';
import { cn } from '@/utils/cn';
import type { Collection } from '@/types';

export function KnowledgeLibrary() {
  const { documents, activeDocumentId, setActiveDocument } = useWorkspaceStore();
  const [query, setQuery] = useState('');
  const [expandedCollection, setExpandedCollection] = useState<string | null>('col-1');

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  );

  const uncategorized = filtered.filter((d) => !d.collectionId);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col gap-4 h-full">
      <SearchBar onSearch={setQuery} className="mx-3" />

      {/* Collections */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {mockCollections.map((col) => {
          const colDocs = filtered.filter((d) => d.collectionId === col.id);
          if (colDocs.length === 0 && query) return null;
          const isExpanded = expandedCollection === col.id;

          return (
            <div key={col.id}>
              <button
                onClick={() => setExpandedCollection(isExpanded ? null : col.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-hover transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-[12px] font-medium text-zinc-400">{col.name}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">{col.documentCount}</span>
                </div>
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 text-zinc-600 transition-transform duration-200',
                  isExpanded ? 'rotate-180' : '',
                )} />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-2"
                  >
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      {colDocs.length > 0 ? (
                        colDocs.map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            document={doc}
                            isActive={activeDocumentId === doc.id}
                            onClick={() => setActiveDocument(doc.id)}
                          />
                        ))
                      ) : (
                        <p className="text-[11px] text-zinc-600 px-3 py-2">No documents</p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Uncategorized */}
        {uncategorized.length > 0 && (
          <div>
            <p className="text-[11px] text-zinc-600 px-3 py-1.5 font-medium uppercase tracking-wider">Other</p>
            {uncategorized.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                isActive={activeDocumentId === doc.id}
                onClick={() => setActiveDocument(doc.id)}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-[12px] text-zinc-600 px-3 py-4 text-center">No documents match your search</p>
        )}
      </div>
    </motion.div>
  );
}
