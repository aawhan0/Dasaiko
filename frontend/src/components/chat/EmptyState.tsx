import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';
import { UploadZone } from '@/components/upload/UploadZone';
import { Sparkles, FileSearch, BrainCircuit } from 'lucide-react';

const FEATURES = [
  { icon: FileSearch, label: 'Document-native AI', description: 'Every answer cites specific pages and passages.' },
  { icon: BrainCircuit, label: 'Deep analysis', description: 'Ask complex questions across multiple documents.' },
  { icon: Sparkles, label: 'Evidence-first', description: 'See exactly where every claim comes from.' },
];

export function EmptyState() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full gap-10 max-w-xl mx-auto w-full px-6 py-12"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-medium text-primary">Dasaiko is ready.</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3 leading-tight">
          Upload documents to begin your research.
        </h2>
        <p className="text-[14px] text-zinc-500 leading-relaxed">
          Add PDFs, research papers, or technical documents. Dasaiko will index them and let you ask questions — always backed by visible, citable evidence.
        </p>
      </div>

      <div className="w-full">
        <UploadZone />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 w-full"
      >
        {FEATURES.map(({ icon: Icon, label, description }) => (
          <motion.div key={label} variants={staggerItem}
            className="flex flex-col gap-2 p-3 rounded-xl border border-white/[0.05] bg-surface text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[12px] font-medium text-zinc-300">{label}</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
