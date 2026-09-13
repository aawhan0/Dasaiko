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
import { useResearchActivity } from "@/hooks/useResearchActivity";
import { STARTER_PAPERS } from "@/utils/starterPapers";

import {
  useEffect,
  useState,
} from "react";

function userStarterData(): { starterPaper?: string; starterQuestion?: string } | null {
  try {
    const paper = sessionStorage.getItem("dasaiko.pendingStarterPaper");
    const question = sessionStorage.getItem("dasaiko.pendingStarterQuestion");
    if (!paper && !question) return null;
    return { starterPaper: paper ?? undefined, starterQuestion: question ?? undefined };
  } catch {
    return null;
  }
}

export function WorkspacePage() {
  const {
    setDocuments,
    setConversations,
    setActiveConversation,
    setMessages,
    setSelectedDocumentId,
    setSelectedPdf,
    messages,
  } = useWorkspaceStore();

  const { record } = useResearchActivity();

  const [evidenceOpen, setEvidenceOpen] = useState(true);

  useEffect(() => {
    const raw = userStarterData();
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const docs = await listDocuments();
        if (cancelled) return;
        setDocuments(docs);

        const loadedConversations = await listConversations();
        if (cancelled) return;
        setConversations(loadedConversations);

        const hasPendingStarter = Boolean(raw?.starterPaper);

        if (!hasPendingStarter && loadedConversations.length > 0) {
          const latestConversation = loadedConversations[0];
          setActiveConversation(latestConversation.id);

          const loadedMessages = await listMessages(latestConversation.id);
          if (cancelled) return;
          setMessages(loadedMessages);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }

        if (raw?.starterPaper) {
          const starter = STARTER_PAPERS.find(
            (paper) => paper.id === raw.starterPaper,
          );

          const matchingDocument = docs.find((document) => {
            const values = [
              document.id,
              document.title,
              document.name,
              document.filename,
              document.fileName,
              document.path,
            ];
            return values.some(
              (value) =>
                typeof value === "string" &&
                (value === raw.starterPaper ||
                  value.includes(raw.starterPaper as string) ||
                  (starter?.title && value.includes(starter.title))),
            );
          });

          if (matchingDocument) {
            const documentId = Number(matchingDocument.id);
            setSelectedDocumentId(Number.isFinite(documentId) ? documentId : null);

            const pdfPath =
              matchingDocument.path ??
              matchingDocument.url ??
              matchingDocument.fileUrl ??
              matchingDocument.pdfUrl ??
              null;
            if (pdfPath) setSelectedPdf(pdfPath);
          }

          try {
            if (raw.starterQuestion) {
              sessionStorage.setItem(
                "dasaiko.pendingComposerQuestion",
                raw.starterQuestion,
              );
            }
            sessionStorage.removeItem("dasaiko.pendingStarterPaper");
            sessionStorage.removeItem("dasaiko.pendingStarterQuestion");
          } catch {
            // Session storage is optional and must not block workspace loading.
          }
        }
      } catch (error) {
        if (!cancelled) console.error("Failed to load workspace:", error);
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
    // Workspace initialization intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pendingPaper = sessionStorage.getItem("dasaiko.pendingStarterPaper");
    if (!pendingPaper) return;

    const isCanonicalStarter = STARTER_PAPERS.some((paper) => paper.id === pendingPaper);
    if (!isCanonicalStarter) return;

    const activityKey = `dasaiko.activity.opened.${pendingPaper}`;
    try {
      const hasOpenedBefore = localStorage.getItem(activityKey) === "1";
      if (sessionStorage.getItem(activityKey) === "1") return;
      sessionStorage.setItem(activityKey, "1");
      localStorage.setItem(activityKey, "1");
      void record(pendingPaper, hasOpenedBefore ? "paper_revisited" : "paper_opened");
    } catch {
      void record(pendingPaper, "paper_opened");
    }
  }, [record]);

  const hasAssistantResponse = messages.some(
    (message) => message.role === "assistant" && Boolean(message.content?.trim()),
  );

  return (
    <AppShell>
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <ResearchWorkbench />
          <PDFBottomSheet />
        </div>

        <AnimatePresence initial={false}>
          {hasAssistantResponse && evidenceOpen && (
            <motion.div
              key="research-evidence"
              initial={{ width: 0, opacity: 0, x: 80 }}
              animate={{ width: 400, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 80 }}
              transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full shrink-0 overflow-hidden"
            >
              <div className="h-full w-[400px]">
                <EvidenceVault onCollapse={() => setEvidenceOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasAssistantResponse && !evidenceOpen && (
            <motion.button
              key="reopen-evidence"
              type="button"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setEvidenceOpen(true)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Open research evidence"
              title="Open research evidence"
              className="group absolute right-4 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.30)] transition-all duration-200 hover:bg-white/[0.92] hover:shadow-[0_5px_20px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#070707]"
            >
              <img src="/assets/brand/dasaiko-mark-black.png" alt="" className="h-5 w-5 object-contain transition-transform duration-200 group-hover:scale-110" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
