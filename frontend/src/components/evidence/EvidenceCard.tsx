import { memo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Hash,
  ChevronRight,
} from "lucide-react";

import { evidenceCard } from "@/utils/animations";
import { cn } from "@/utils/cn";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import type { EvidenceChunk } from "@/types";

interface EvidenceCardProps {
  chunk: EvidenceChunk;
  index: number;
  isHighlighted?: boolean;
}

export const EvidenceCard = memo(
  function EvidenceCard({
    chunk,
    index,
    isHighlighted,
  }: EvidenceCardProps) {
    const paperTitle =
      chunk.documentName;

    const relevance = Math.round(
      (1 / (1 + Math.exp(-chunk.score))) * 100
    );

    const {
      documents,
      setSelectedPdf,
      setSelectedEvidence,
    } = useWorkspaceStore();

    const relevanceColor =
      relevance >= 80
        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
      : relevance >= 50
      ? "bg-violet-500/10 text-violet-300 border-violet-500/25"
      : "bg-purple-950/40 text-purple-400 border-purple-900/40";

    const handleOpenSource = () => {
      const doc = documents.find(
        (d) =>
          d.id.toString() ===
          chunk.documentId
      );

      if (!doc) {
        console.error(
          "Evidence document not found:",
          chunk.documentId
        );

        return;
      }

      setSelectedEvidence(chunk);

      setSelectedPdf(
        doc.filePath
      );
    };

    return (
      <motion.button
        type="button"
        variants={evidenceCard}
        initial="hidden"
        animate="visible"
        transition={{
          delay: index * 0.05,
        }}
        whileHover={{
          y: -2,
        }}
        onClick={handleOpenSource}
        className={cn(
          "group w-full overflow-hidden rounded-xl border text-left transition-all duration-300",
          "h-[82px] hover:h-[190px]",
          isHighlighted
            ? "border-primary/40 bg-primary/[0.05] shadow-[0_0_18px_rgba(124,58,237,0.25)]"
            : "border-white/[0.06] bg-surface hover:border-primary/20 hover:shadow-[0_0_18px_rgba(124,58,237,0.18)]"
        )}
      >
        <div className="p-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">

            <div className="flex min-w-0 items-start gap-2">

              <div className="mt-0.5">
                <FileText className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">

                <h3 className="truncate text-sm font-semibold text-white">
                  {paperTitle}
                </h3>

                <div className="flex items-center gap-3 text-zinc-500">

                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Chunk {chunk.chunkIndex}
                  </span>

                  <span>
                    Page {chunk.pageNumber}
                  </span>

                </div>

              </div>

            </div>

            <span
              className={cn(
                "flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold",
                relevanceColor
              )}
            >
              {relevance}%
            </span>

          </div>

          {/* Preview */}
          <div className="mt-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

            <p className="line-clamp-5 text-xs leading-6 text-zinc-400">
              {chunk.preview}
            </p>

            <div className="mt-4 flex items-center gap-1 text-xs text-primary">

              Open Source

              <ChevronRight className="h-3 w-3" />

            </div>

          </div>

        </div>
      </motion.button>
    );
  }
);