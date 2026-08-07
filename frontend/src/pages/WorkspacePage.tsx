import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
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
        // Load Documents
        // -----------------------------
        const docs = await listDocuments();
        setDocuments(docs);

        console.log("Loaded documents:");
        console.table(docs);

        // -----------------------------
        // Load Conversations
        // -----------------------------
        const conversations =
          await listConversations();

        setConversations(conversations);

        console.log("Loaded conversations:");
        console.table(conversations);

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
      <div className="flex-1 grid grid-cols-[1fr_auto] h-full w-full overflow-hidden">
        <ResearchWorkbench />
        <EvidenceVault />
      </div>
    </AppShell>
  );
}