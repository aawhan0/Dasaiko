import { motion } from "framer-motion";
import {
  Database,
  Sparkles,
} from "lucide-react";

import { EvidenceCard } from "./EvidenceCard";
import { EvidenceEmpty } from "./EvidenceEmpty";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import {
  fadeIn,
  staggerContainer,
} from "@/utils/animations";

import type { EvidenceChunk } from "@/types";

export function EvidenceVault() {
  const {
    activeEvidence,
    messages,
  } = useWorkspaceStore();

  const assistantMessages =
    messages.filter(
      (m) => m.role === "assistant"
    );

  const latestAnswer =
    assistantMessages[
      assistantMessages.length - 1
    ];

  const evidence =
    latestAnswer?.evidence ??
    activeEvidence;

  const hasEvidence =
    evidence.length > 0;

  return (
    <motion.aside
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="
        w-full
        min-w-0
        h-full
        flex
        flex-col
        overflow-hidden
        border-l
        border-white/[0.06]
        bg-[#070707]
      "
    >
      {/* Header */}
      <div className="shrink-0 px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 text-primary" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              Research Evidence
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Every answer is grounded in retrieved paper chunks.
            </p>
          </div>
        </div>

        {hasEvidence && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs text-primary">
            <Sparkles className="w-3 h-3" />

            {evidence.length} source
            {evidence.length !== 1
              ? "s"
              : ""}
          </div>
        )}
      </div>

      {/* Evidence */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {hasEvidence ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {evidence.map(
              (
                chunk: EvidenceChunk,
                index: number
              ) => (
                <EvidenceCard
                  key={chunk.id}
                  chunk={chunk}
                  index={index}
                />
              )
            )}
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center px-2">
            <EvidenceEmpty />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
