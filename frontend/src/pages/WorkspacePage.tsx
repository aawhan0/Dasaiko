import { useEffect } from "react";

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
  } = useWorkspaceStore();


  useEffect(() => {

    let cancelled = false;


    async function loadWorkspace() {

      try {

        // -----------------------------------------
        // Documents
        // -----------------------------------------

        const docs =
          await listDocuments();


        if (cancelled) {
          return;
        }


        setDocuments(docs);


        // -----------------------------------------
        // Conversations
        // -----------------------------------------

        const conversations =
          await listConversations();


        if (cancelled) {
          return;
        }


        setConversations(
          conversations
        );


        // -----------------------------------------
        // Restore latest conversation
        // -----------------------------------------

        if (
          conversations.length > 0
        ) {

          const latestConversation =
            conversations[0];


          setActiveConversation(
            latestConversation.id
          );


          const messages =
            await listMessages(
              latestConversation.id
            );


          if (cancelled) {
            return;
          }


          setMessages(messages);

        } else {

          setActiveConversation(null);

          setMessages([]);

        }

      } catch (err) {

        if (!cancelled) {

          console.error(
            "Failed to load workspace:",
            err
          );

        }

      }

    }


    loadWorkspace();


    return () => {

      cancelled = true;

    };

    // IMPORTANT:
    // Workspace initialization should happen once.
    // The store setters must remain stable.
    // They should NOT cause this effect to reload
    // the workspace after every state update.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
  <>
    <AppShell>

      <div className="flex min-w-0 min-h-0 flex-1">

        {/* --------------------------------------- */}
        {/* Central Workbench */}
        {/* --------------------------------------- */}

        <div className="relative flex min-w-0 flex-1 overflow-hidden">

          <ResearchWorkbench />

          {/* PDF Viewer Overlay */}
          <PDFBottomSheet />

        </div>


        {/* --------------------------------------- */}
        {/* Evidence */}
        {/* --------------------------------------- */}

        <div className="w-[400px] flex-shrink-0 border-l border-white/[0.06]">

          <EvidenceVault />

        </div>

      </div>

    </AppShell>
  </>
);
}