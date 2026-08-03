import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ResearchWorkbench } from "@/components/chat/ResearchWorkbench";
import { EvidenceVault } from "@/components/evidence/EvidenceVault";

import { listDocuments } from "@/services/documents";
import { listConversations } from "@/services/conversations";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function WorkspacePage() {
  const {
    setDocuments,
    setConversations,
    setActiveConversation,
  } = useWorkspaceStore();

  useEffect(() => {
    async function loadWorkspace() {
      try {
        // Load documents
        const docs = await listDocuments();
        setDocuments(docs);

        console.log("Loaded documents:");
        console.table(docs);

        // Load conversations
        const conversations = await listConversations();
        setConversations(conversations);

        console.log("Loaded conversations:");
        console.table(conversations);

        // Automatically select the newest conversation
        if (conversations.length > 0) {
          setActiveConversation(
            String(conversations[0].id)
          );
        }
      } catch (err) {
        console.error("Failed to load workspace:", err);
      }
    }

    loadWorkspace();
  }, [
    setDocuments,
    setConversations,
    setActiveConversation,
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