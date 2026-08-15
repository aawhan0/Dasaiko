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

  /* =====================================================
     FIND CURRENT EVIDENCE
  ====================================================== */

  const assistantMessages =
    messages.filter(
      (message) =>
        message.role === "assistant",
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
        flex
        h-full
        min-w-0
        w-full
        flex-col
        overflow-hidden
        border-l-[1.5px]
        border-white/[0.07]
        bg-[#070707]
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          shrink-0
          border-b-[1.5px]
          border-white/[0.07]
          px-5
          py-5
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          {/* Title */}

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2.5
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-primary/20
                  bg-primary/[0.07]
                "
              >
                <Database
                  className="
                    h-3.5
                    w-3.5
                    text-primary
                  "
                />
              </div>

              <h2
                className="
                  text-[13px]
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Research Evidence
              </h2>
            </div>

            <p
              className="
                mt-3
                max-w-[260px]
                text-[10px]
                font-medium
                leading-5
                text-zinc-500
              "
            >
              Sources retrieved to support
              the current answer.
            </p>
          </div>

          {/* Source count */}

          {hasEvidence && (
            <div
              className="
                flex
                shrink-0
                items-center
                gap-1.5
                rounded-lg
                border
                border-primary/15
                bg-primary/[0.045]
                px-2.5
                py-1.5
              "
            >
              <Sparkles
                className="
                  h-3
                  w-3
                  text-primary/80
                "
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-primary/80
                "
              >
                {evidence.length}{" "}
                {evidence.length === 1
                  ? "source"
                  : "sources"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          EVIDENCE CONTENT
      ================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain

          px-4
          py-4

          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.10)_transparent]
        "
      >
        {hasEvidence ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="
              space-y-2.5
            "
          >
            {evidence.map(
              (
                chunk: EvidenceChunk,
                index: number,
              ) => (
                <EvidenceCard
                  key={chunk.id}
                  chunk={chunk}
                  index={index}
                />
              ),
            )}
          </motion.div>
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              px-2
            "
          >
            <EvidenceEmpty />
          </div>
        )}
      </div>
    </motion.aside>
  );
}