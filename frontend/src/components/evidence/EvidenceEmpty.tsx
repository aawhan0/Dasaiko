import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { fadeInUp } from '@/utils/animations';

export function EvidenceEmpty() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center h-full"
    >
      <div className="w-12 h-12 rounded-xl bg-surface border border-white/[0.06] flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-zinc-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1">No evidence yet</p>
        <p className="text-xs text-zinc-600 max-w-48 leading-relaxed">
          Ask a question to see source citations and supporting evidence appear here.
        </p>
      </div>
    </motion.div>
  );
}
