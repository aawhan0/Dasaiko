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
        100
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
          y: -3,
          scale: 1.012,

          boxShadow:
            "0 10px 30px rgba(124, 58, 237, 0.16)",

          borderColor:
            "rgba(124, 58, 237, 0.32)",

          transition: {
            duration: 0.18,
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
            border
            text-left
            bg-surface
          `,

          `
            border-white/[0.06]
          `,

          isHighlighted
            ? `
              border-primary/40
              bg-primary/[0.05]
              shadow-[0_0_18px_rgba(124,58,237,0.25)]
            `
            : ""
        )}
      >

        {/* Card Content */}

        <div className="px-4 py-3.5">

          {/* Header */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >

            <div
              className="
                flex
                min-w-0
                items-start
                gap-2
              "
            >

              <div
                className="
                  mt-0.5
                  shrink-0
                "
              >

                <FileText
                  className="
                    h-4
                    w-4
                    text-primary
                  "
                />

              </div>


              <div className="min-w-0">

                <h3
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-white
                  "
                  title={paperTitle}
                >
                  {paperTitle}
                </h3>


              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-zinc-500
                "
              >
                <span>
                  Page {chunk.pageNumber}
                </span>

                <span className="text-zinc-700">
                  ·
                </span>

                <span>
                  Evidence
                </span>
              </div>  

              </div>

            </div>


            {/* Relevance */}

            <span
              className={cn(
                `
                  shrink-0
                  rounded-full
                  border
                  px-2
                  py-1
                  text-[10px]
                  font-semibold
                `,
                relevanceColor
              )}
            >
              {relevance}%
            </span>

          </div>


          {/* Preview */}

          <div
            className="
              mt-3
              border-t
              border-white/[0.05]
              pt-3
            "
          >

            <p
              className="
                line-clamp-3
                text-xs
                leading-5
                text-zinc-400
              "
            >
              {chunk.preview}
            </p>


            {/* Action */}

            <motion.div
              className="
                mt-2.5
                flex
                items-center
                gap-1
                text-[11px]
                font-medium
                text-primary
              "
            >

              View in paper

              <motion.div
                initial={{
                  x: 0,
                }}

                whileHover={{
                  x: 3,
                }}

                transition={{
                  duration: 0.15,
                }}
              >

                <ChevronRight
                  className="
                    h-3
                    w-3
                  "
                />

              </motion.div>

            </motion.div>

          </div>

        </div>

      </motion.button>

    );
  }
);