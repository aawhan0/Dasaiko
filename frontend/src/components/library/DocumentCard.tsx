import { motion } from 'framer-motion';
import { FileText, MoreHorizontal, Clock, Layers } from 'lucide-react';
import { staggerItem } from '@/utils/animations';
import { CollectionTag } from './CollectionTag';
import { cn } from '@/utils/cn';
import { formatFileSize, formatRelativeDate } from '@/utils/formatters';
import type { Document, Collection } from '@/types';

interface DocumentCardProps {
  document: Document;
  collection?: Collection;
  isActive?: boolean;
  onClick?: () => void;
}

const statusDot: Record<Document['status'], string> = {
  ready: 'bg-emerald-400',
  processing: 'bg-amber-400 animate-pulse',
  uploading: 'bg-indigo-400 animate-pulse',
  error: 'bg-red-400',
};

export function DocumentCard({ document, collection, isActive, onClick }: DocumentCardProps) {
  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group',
        isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-hover border border-transparent',
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
        isActive ? 'bg-primary/15 border-primary/30' : 'bg-surface border-white/[0.06]',
      )}>
        <FileText className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-zinc-500')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={cn(
            'text-[13px] font-medium truncate leading-tight',
            isActive ? 'text-white' : 'text-zinc-300',
          )}>
            {document.name.replace(/\.pdf$|\.(txt|md|docx)$/, '')}
          </span>
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', statusDot[document.status])} />
        </div>
        <div className="flex items-center gap-2">
          {collection && <CollectionTag name={collection.name} color={collection.color} />}
          {!collection && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
              <Clock className="w-3 h-3" />
              {formatRelativeDate(document.uploadedAt)}
            </span>
          )}
          {document.pageCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
              <Layers className="w-3 h-3" />
              {document.pageCount}p
            </span>
          )}
        </div>
      </div>

      {/* More menu placeholder */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-all flex-shrink-0"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
    </motion.button>
  );
}
