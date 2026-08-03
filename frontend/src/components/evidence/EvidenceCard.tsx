import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Hash } from 'lucide-react';
import { evidenceCard } from '@/utils/animations';
import { SimilarityBadge } from './SimilarityBadge';
import { truncate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { EvidenceChunk } from '@/types';

interface EvidenceCardProps {
  chunk: EvidenceChunk;
  index: number;
  isHighlighted?: boolean;
}

export const EvidenceCard = memo(function EvidenceCard({ chunk, index, isHighlighted }: EvidenceCardProps) {
  const displayName = chunk.documentName.replace(/\.pdf$/i, '');

  return (
    <motion.div
      variants={evidenceCard}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.06 }}
      className={cn(
        'group p-4 rounded-xl border transition-all duration-200',
        isHighlighted
          ? 'border-primary/30 bg-primary/[0.04]'
          : 'border-white/[0.06] bg-surface hover:border-white/[0.10] hover:bg-hover',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-[12px] font-medium text-zinc-300 truncate leading-tight">
            {displayName}
          </p>
        </div>
        <SimilarityBadge
          score={chunk.score}
          className="flex-shrink-0"
        />
      </div>

      <p className="text-[12px] text-zinc-500 leading-relaxed mb-3">
        {truncate(chunk.preview, 160)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
            <span className="text-zinc-700">pg</span>
            {chunk.page ?? "-"}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
            <Hash className="w-3 h-3" />
            {chunk.chunkIndex}
          </span>
        </div>
        <button
          aria-label={`Open page ${chunk.chunkIndex} in ${displayName}`}
          className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </button>
      </div>
    </motion.div>
  );
});
