import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ResearchWorkbench } from "@/components/chat/ResearchWorkbench";
import { EvidenceVault } from "@/components/evidence/EvidenceVault";

import { listDocuments } from "@/services/documents";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function WorkspacePage() {
  const { setDocuments } = useWorkspaceStore();

  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await listDocuments();

        console.log("Loaded documents:");
        console.log(docs);

        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    }

    loadDocuments();
  }, [setDocuments]);

  return (
    <AppShell>
      <div className="flex-1 grid grid-cols-[1fr_auto] h-full w-full overflow-hidden">
        <ResearchWorkbench />
        <EvidenceVault />
      </div>
    </AppShell>
  );
}