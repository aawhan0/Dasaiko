import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
} from "lucide-react";

import { fadeInUp } from "@/utils/animations";

export function EvidenceEmpty() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col items-center justify-center px-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <BookOpen className="h-7 w-7 text-primary" />
      </div>

      <h3 className="text-base font-semibold text-white">
        Research Evidence
      </h3>

      <p className="mt-2 max-w-[240px] text-sm leading-6 text-zinc-500">
        Ask a question about an uploaded paper.
        Relevant research evidence will appear here.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
        <Sparkles className="h-3 w-3" />
        AI Grounded Responses
      </div>
    </motion.div>
  );
}