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
    activeConversationId,
  } = useWorkspaceStore();


  /*
   * No active conversation means there is
   * nothing meaningful for the evidence panel
   * to show.
   *
   * Do not render an empty "Research Evidence"
   * panel on the landing state.
   */

  if (!activeConversationId) {
    return null;
  }


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

        border-l
        border-white/[0.07]

        bg-[#070707]
      "
    >

      {/* ===============================================
          HEADER
      ============================================== */}

      <div
        className="
          shrink-0
          border-b
          border-white/[0.07]
          px-5
          py-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              min-w-0
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


            <div className="min-w-0">

              <h2
                className="
                  text-[13px]
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Research Evidence
              </h2>

              <p
                className="
                  mt-1
                  truncate
                  text-[10px]
                  text-zinc-600
                "
              >
                Sources behind your answer
              </p>

            </div>

          </div>


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
                px-2
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
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-primary/80
                "
              >
                {evidence.length}
              </span>

            </div>
          )}

        </div>

      </div>


      {/* ===============================================
          CONTENT
      ============================================== */}

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