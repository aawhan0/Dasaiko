import { memo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
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
      (1 /
        (1 +
          Math.exp(-chunk.score))) *
        100,
    );

    const {
      documents,
      setSelectedPdf,
      setSelectedEvidence,
    } = useWorkspaceStore();

    const relevanceColor =
      relevance >= 80
        ? "border-primary/25 bg-primary/[0.08] text-primary-300"
        : relevance >= 50
          ? "border-primary/15 bg-primary/[0.045] text-primary-300"
          : "border-white/[0.08] bg-white/[0.025] text-zinc-400";

    const handleOpenSource = () => {
      const doc = documents.find(
        (d) =>
          d.id.toString() ===
          chunk.documentId,
      );

      if (!doc) {
        console.error(
          "Evidence document not found:",
          chunk.documentId,
        );

        return;
      }

      setSelectedEvidence(chunk);
      setSelectedPdf(doc.filePath);
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
          y: -1,
          transition: {
            duration: 0.16,
            ease: "easeOut",
          },
        }}
        whileTap={{
          scale: 0.995,
          transition: {
            duration: 0.08,
          },
        }}
        onClick={handleOpenSource}
        className={cn(
          `
            group
            relative
            w-full
            overflow-hidden
            rounded-xl
            border-[1.5px]
            bg-surface
            text-left
            transition-colors
            duration-200

            hover:border-white/[0.15]
            hover:bg-white/[0.025]
          `,
          isHighlighted
            ? `
              border-primary/40
              bg-primary/[0.055]
              shadow-[0_0_24px_rgba(99,102,241,0.10)]
            `
            : `
              border-white/[0.075]
            `,
        )}
      >
        {/* =================================================
            TOP ACCENT
        ================================================== */}

        <div
          className={cn(
            `
              absolute
              inset-x-0
              top-0
              h-px
              opacity-0
              transition-opacity
              duration-200
              group-hover:opacity-100
            `,
            isHighlighted
              ? "bg-primary/70 opacity-100"
              : "bg-white/20",
          )}
        />

        <div className="px-4 py-4">
          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
              "
            >
              <div
                className="
                  mt-0.5
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  transition-colors
                  group-hover:border-primary/20
                  group-hover:bg-primary/[0.06]
                "
              >
                <FileText
                  className="
                    h-3.5
                    w-3.5
                    text-zinc-500
                    transition-colors
                    group-hover:text-primary
                  "
                />
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    truncate
                    text-[13px]
                    font-bold
                    tracking-tight
                    text-zinc-100
                  "
                  title={paperTitle}
                >
                  {paperTitle}
                </h3>

                <div
                  className="
                    mt-1.5
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.08em]
                    text-zinc-600
                  "
                >
                  <span>
                    Page {chunk.pageNumber}
                  </span>

                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                      bg-zinc-700
                    "
                  />

                  <span>
                    Chunk {chunk.chunkIndex}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                RELEVANCE
            ================================================== */}

            <span
              className={cn(
                `
                  shrink-0
                  rounded-lg
                  border
                  px-2
                  py-1
                  text-[9px]
                  font-bold
                  tracking-[0.04em]
                `,
                relevanceColor,
              )}
            >
              {relevance}%
            </span>
          </div>

          {/* =================================================
              EVIDENCE PREVIEW
          ================================================== */}

          <div
            className="
              mt-4
              border-t
              border-white/[0.07]
              pt-3.5
            "
          >
            <p
              className="
                line-clamp-3
                text-[12px]
                font-medium
                leading-[1.65]
                text-zinc-400
                transition-colors
                group-hover:text-zinc-300
              "
            >
              {chunk.preview}
            </p>

            {/* =================================================
                ACTION
            ================================================== */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-zinc-600
                  transition-colors
                  group-hover:text-primary/80
                "
              >
                Source evidence
              </span>

              <motion.div
                className="
                  flex
                  items-center
                  gap-1
                  text-[10px]
                  font-bold
                  text-zinc-500
                  transition-colors
                  group-hover:text-zinc-200
                "
                whileHover={{
                  x: 2,
                }}
              >
                View in paper

                <ChevronRight
                  className="
                    h-3
                    w-3
                  "
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.button>
    );
  },
);