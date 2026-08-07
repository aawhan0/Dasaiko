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
    async function loadWorkspace() {
      try {
        // -----------------------------
        // Documents
        // -----------------------------
        const docs = await listDocuments();
        setDocuments(docs);

        // -----------------------------
        // Conversations
        // -----------------------------
        const conversations =
          await listConversations();

        setConversations(conversations);

        // -----------------------------
        // Restore latest conversation
        // -----------------------------
        if (conversations.length > 0) {
          const latestConversation =
            conversations[0];

          setActiveConversation(
            latestConversation.id
          );

          const messages =
            await listMessages(
              latestConversation.id
            );

          setMessages(messages);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (err) {
        console.error(
          "Failed to load workspace:",
          err
        );
      }
    }

    loadWorkspace();
  }, [
    setDocuments,
    setConversations,
    setActiveConversation,
    setMessages,
  ]);

  return (
  <AppShell>
    <div className="relative flex h-full w-full overflow-hidden">

      {/* Chat */}
      <div className="flex min-w-0 flex-1">
        <ResearchWorkbench />
      </div>

      {/* Evidence */}
      <div className="w-[400px] flex-shrink-0 border-l border-white/[0.06]">
        <EvidenceVault />
      </div>

      {/* PDF Bottom Sheet */}
      <PDFBottomSheet />

    </div>
  </AppShell>
);
}