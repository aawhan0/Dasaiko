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
        w-[380px]
        flex-shrink-0
        flex
        flex-col
        border-l
        border-white/[0.06]
        bg-[#070707]
      "
    >
      {/* Header */}

      <div className="px-5 py-5 border-b border-white/[0.06]">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-primary" />
          </div>

          <div>

            <h2 className="text-sm font-semibold text-white">
              Research Evidence
            </h2>

            <p className="text-xs text-zinc-500">
              Every answer is grounded in retrieved paper chunks.
            </p>

          </div>

        </div>

        {hasEvidence && (

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary">

            <Sparkles className="w-3 h-3" />

            {evidence.length} source
            {evidence.length !== 1
              ? "s"
              : ""}

          </div>

        )}

      </div>

      {/* Evidence */}

      <div className="flex-1 overflow-y-auto p-4">

        {hasEvidence ? (

          <motion.div
            variants={
              staggerContainer
            }
            initial="hidden"
            animate="visible"
            className="space-y-3"
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

          <EvidenceEmpty />

        )}

      </div>

    </motion.aside>
  );
}