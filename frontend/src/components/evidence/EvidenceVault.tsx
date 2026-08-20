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


interface EvidenceVaultProps {
  onCollapse?: () => void;
}


export function EvidenceVault({
  onCollapse,
}: EvidenceVaultProps) {

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

          {/* -------------------------------------------
              TITLE
          -------------------------------------------- */}

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


          {/* -------------------------------------------
              HEADER ACTIONS
          -------------------------------------------- */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            {/* Evidence count */}

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


            {/* -----------------------------------------
                DASAIKO COLLAPSE BUTTON
            ------------------------------------------ */}

            <button
              type="button"

              onClick={onCollapse}

              aria-label="Collapse research evidence"
              title="Collapse research evidence"

              className="
                group

                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center

                rounded-full

                border
               border-white/[0.12]

               bg-white

                shadow-[0_2px_10px_rgba(0,0,0,0.20)]

                transition-all
                duration-200

               hover:bg-white/[0.92]
                hover:shadow-[0_3px_14px_rgba(0,0,0,0.28)]

                active:scale-95

                focus:outline-none
                focus:ring-2
               focus:ring-white/30
                focus:ring-offset-2
                focus:ring-offset-[#070707]
                          "
              >

              <img
                src="/assets/brand/dasaiko-mark-black.png"
                alt=""
                className="
                  h-4
                  w-4
                  object-contain

                  transition-transform
                  duration-200

                  group-hover:scale-110
                "
              />

            </button>

          </div>

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