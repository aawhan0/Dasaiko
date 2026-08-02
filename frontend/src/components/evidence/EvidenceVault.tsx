import { motion } from 'framer-motion';
import { Database, ChevronRight } from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceEmpty } from './EvidenceEmpty';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { fadeIn, staggerContainer } from '@/utils/animations';
import type { EvidenceChunk } from '@/types';

export function EvidenceVault() {
  const { activeEvidence, messages } = useWorkspaceStore();

  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const latestAnswer = assistantMessages[assistantMessages.length - 1];
  const evidence = latestAnswer?.evidence ?? activeEvidence;
  const hasEvidence = evidence.length > 0;

  return (
    <motion.aside
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full border-l border-white/[0.06] bg-[#070707] w-[380px] flex-shrink-0"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-white leading-tight">Evidence Vault</h3>
            {hasEvidence && (
              <p className="text-[10px] text-zinc-600">{evidence.length} source{evidence.length !== 1 ? 's' : ''} found</p>
            )}
          </div>
        </div>
        {hasEvidence && (
          <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
            Latest answer <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {hasEvidence ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {evidence.map((chunk: EvidenceChunk, i: number) => (
              <EvidenceCard key={chunk.id} chunk={chunk} index={i} />
            ))}
          </motion.div>
        ) : (
          <EvidenceEmpty />
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
        <p className="text-[10px] text-zinc-700 leading-relaxed">
          Every AI answer is grounded in your uploaded documents. Evidence is ranked by semantic similarity.
        </p>
      </div>
    </motion.aside>
  );
}
