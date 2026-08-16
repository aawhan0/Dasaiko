import { useEffect } from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { AppShell } from "@/components/layout/AppShell";
import { PDFBottomSheet } from "@/components/pdf/PDFBottomSheet";

import { ResearchWorkbench } from "@/components/chat/ResearchWorkbench";
import { EvidenceVault } from "@/components/evidence/EvidenceVault";

import { listDocuments } from "@/services/documents";
import { listConversations } from "@/services/conversations";
import { listMessages } from "@/services/messages";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";


export function WorkspacePage() {

  const {
    setDocuments,
    setConversations,
    setActiveConversation,
    setMessages,

    conversations,
    messages,
  } = useWorkspaceStore();


  /* =====================================================
     LOAD WORKSPACE
  ====================================================== */

  useEffect(() => {

    let cancelled = false;


    async function loadWorkspace() {

      try {

        /* -----------------------------------------------
           Documents
        ------------------------------------------------ */

        const docs =
          await listDocuments();


        if (cancelled) {
          return;
        }


        setDocuments(docs);


        /* -----------------------------------------------
           Conversations
        ------------------------------------------------ */

        const loadedConversations =
          await listConversations();


        if (cancelled) {
          return;
        }


        setConversations(
          loadedConversations,
        );


        /* -----------------------------------------------
           Restore latest conversation
        ------------------------------------------------ */

        if (
          loadedConversations.length > 0
        ) {

          const latestConversation =
            loadedConversations[0];


          setActiveConversation(
            latestConversation.id,
          );


          const loadedMessages =
            await listMessages(
              latestConversation.id,
            );


          if (cancelled) {
            return;
          }


          setMessages(
            loadedMessages,
          );

        } else {

          setActiveConversation(
            null,
          );

          setMessages([]);

        }

      } catch (error) {

        if (!cancelled) {

          console.error(
            "Failed to load workspace:",
            error,
          );

        }

      }

    }


    loadWorkspace();


    return () => {

      cancelled = true;

    };


    // Workspace initialization intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);


  /* =====================================================
     DETERMINE WHEN EVIDENCE PANEL SHOULD EXIST
  ====================================================== */

  const hasAssistantResponse =
    messages.some(
      (message) =>
        message.role === "assistant" &&
        Boolean(
          message.content?.trim(),
        ),
    );


  return (
    <AppShell>

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          overflow-hidden
        "
      >

        {/* =================================================
            CENTRAL WORKBENCH
        ================================================= */}

        <div
          className="
            relative
            flex
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
          "
        >

          <ResearchWorkbench />


          {/* -----------------------------------------------
              PDF VIEWER
          ------------------------------------------------ */}

          <PDFBottomSheet />

        </div>


        {/* =================================================
            EVIDENCE PANEL
        ================================================= */}

        <AnimatePresence
          initial={false}
        >

          {hasAssistantResponse && (

            <motion.div
              key="research-evidence"

              initial={{
                width: 0,
                opacity: 0,
                x: 80,
              }}

              animate={{
                width: 400,
                opacity: 1,
                x: 0,
              }}

              exit={{
                width: 0,
                opacity: 0,
                x: 80,
              }}

              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}

              className="
                relative
                h-full
                shrink-0
                overflow-hidden
              "
            >

              <div
                className="
                  h-full
                  w-[400px]
                "
              >

                <EvidenceVault />

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </AppShell>
  );
}