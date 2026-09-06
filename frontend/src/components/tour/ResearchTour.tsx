import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useResearchPreferences } from "@/hooks/useResearchPreferences";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { recommendResearchDocument } from "@/utils/researchRecommendation";
import { buildResearchTourPrompt } from "@/utils/researchTourPrompt";
import {
  RESEARCH_TOPICS,
  TOUR_STORAGE_KEYS,
  type ResearchTourStep,
} from "./tourConfig";
import { markResearchTourActive, markResearchTourCompleted } from "@/utils/researchTourState";
import { RESEARCH_TOUR_COPY } from "./tourCopy";
import { ResearchTourOverlay } from "./ResearchTourOverlay";
import { ResearchTourWelcome } from "./ResearchTourWelcome";

interface ResearchTourProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

function useTourTarget(selector: string, enabled: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!enabled) {
      setRect(null);
      return;
    }

    const element = document.querySelector<HTMLElement>(selector);
    setRect(element?.getBoundingClientRect() ?? null);
  }, [enabled, selector]);

  useEffect(() => {
    if (!enabled) return;

    update();
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [enabled, update]);

  return rect;
}

function Spotlight({ rect }: { rect: DOMRect | null }) {
  if (!rect) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed z-[101] rounded-2xl border border-primary/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_34px_rgba(99,102,241,0.20)]"
      style={{
        left: rect.left - 8,
        top: rect.top - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }}
    />
  );
}

function TourCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="pointer-events-auto fixed bottom-6 left-1/2 z-[102] w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:bottom-8"
    >
      {children}
    </motion.div>
  );
}

function StepLabel({ step }: { step: keyof typeof RESEARCH_TOUR_COPY }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
      {RESEARCH_TOUR_COPY[step].eyebrow}
    </span>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400"
    >
      Skip tour
    </button>
  );
}

function Navigation({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-5 flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110"
      >
        {nextLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PreferencesStep({ onNext, onFinish }: { onNext: () => void; onFinish: () => void }) {
  const { preferences, updatePreferences } = useResearchPreferences();
  const [topics, setTopics] = useState(preferences.topics);

  const toggle = (topic: string) => {
    setTopics((current) => current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]);
  };

  return (
    <ResearchTourOverlay>
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="preferences" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.preferences.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.preferences.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {RESEARCH_TOPICS.map((topic) => {
            const selected = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggle(topic)}
                aria-pressed={selected}
                className={selected ? "rounded-xl border border-primary/40 bg-primary/[0.10] px-3 py-2 text-[11px] font-medium text-primary transition" : "rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:border-white/[0.14] hover:text-zinc-300"}
              >{topic}</button>
            );
          })}
        </div>
        <Navigation onNext={() => { updatePreferences(topics); onNext(); }} nextLabel="Continue" />
      </TourCard>
    </ResearchTourOverlay>
  );
}

function QuestionStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const rect = useTourTarget('[data-tour="research-question"]', true);
  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="question" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.question.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.question.description}</p>
        <Navigation onBack={onBack} onNext={onNext} nextLabel="Show me a paper" />
      </TourCard>
    </ResearchTourOverlay>
  );
}

function PaperStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const rect = useTourTarget('[data-tour="first-document"]', true);
  const documents = useWorkspaceStore((state) => state.documents);
  const { preferences } = useResearchPreferences();
  const setActiveDocument = useWorkspaceStore((state) => state.setActiveDocument);
  const setSelectedEvidence = useWorkspaceStore((state) => state.setSelectedEvidence);
  const setSelectedPdf = useWorkspaceStore((state) => state.setSelectedPdf);
  const [error, setError] = useState<string | null>(null);
  const recommendation = recommendResearchDocument(documents, preferences.topics);

  const openPaper = useCallback(() => {
    const target = document.querySelector<HTMLElement>('[data-tour="first-document"]');
    const targetId = target?.dataset.tourDocumentId;
    const selected = recommendation?.document ?? documents.find((item) => item.id === targetId) ?? documents.find((item) => item.status === "ready");

    if (!selected?.filePath) {
      setError(documents.length === 0 ? "Your workspace has no paper to open yet." : "A ready paper is still loading.");
      return;
    }

    setActiveDocument(selected.id);
    setSelectedEvidence(null);
    setSelectedPdf(selected.filePath);
    try {
      localStorage.setItem(TOUR_STORAGE_KEYS.prompt, buildResearchTourPrompt(selected.title));
    } catch {
      // The tour still works if browser storage is unavailable.
    }
    onNext();
  }, [documents, onNext, recommendation, setActiveDocument, setSelectedEvidence, setSelectedPdf]);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>('[data-tour="first-document"]');
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [documents.length]);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="paper" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.paper.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.paper.description}</p>
        {recommendation && preferences.topics.length > 0 && (
          <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/70">Recommended for you</p>
            <p className="mt-1 truncate text-xs font-medium text-zinc-200">{recommendation.document.title}</p>
            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Matches: {recommendation.matchedTopics.join(" · ") || "your research workspace"}</p>
          </div>
        )}
        {error && <p role="alert" className="mt-3 text-[11px] leading-4 text-amber-400">{error}</p>}
        <Navigation onBack={onBack} onNext={openPaper} nextLabel="Open the paper" />
      </TourCard>
    </ResearchTourOverlay>
  );
}

function ViewerStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const rect = useTourTarget('[data-tour="paper-viewer"]', true);
  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="viewer" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.viewer.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.viewer.description}</p>
        {!rect && <p className="mt-3 text-[11px] leading-4 text-zinc-600">Opening the paper viewer…</p>}
        <Navigation onBack={onBack} onNext={onNext} nextLabel="Try it yourself" />
      </TourCard>
    </ResearchTourOverlay>
  );
}

function InferenceStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const rect = useTourTarget('[data-tour="research-question"]', true);
  const messages = useWorkspaceStore((state) => state.messages);
  const initialCount = useRef(messages.length);
  const hasAnswer = messages.length > initialCount.current && messages.some((message) => message.role === "assistant" && Boolean(message.content?.trim()));

  useEffect(() => {
    if (hasAnswer) onNext();
  }, [hasAnswer, onNext]);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="inference" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.inference.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.inference.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"><ArrowLeft className="h-3.5 w-3.5" />Back</button>
          {hasAnswer ? <button type="button" onClick={onNext} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110">See the evidence<ArrowRight className="h-3.5 w-3.5" /></button> : <span className="text-[10px] text-zinc-600">Waiting for your question…</span>}
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function EvidenceStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const rect = useTourTarget('[data-tour="research-evidence"]', true);
  const activeEvidence = useWorkspaceStore((state) => state.activeEvidence);
  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between"><StepLabel step="evidence" /><SkipButton onSkip={onFinish} /></div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.evidence.title}</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.evidence.description}</p>
        <p className="mt-3 text-[10px] text-zinc-600">{activeEvidence.length} evidence source{activeEvidence.length === 1 ? "" : "s"} retrieved.</p>
        <Navigation onBack={onBack} onNext={onNext} nextLabel="Finish tour" />
      </TourCard>
    </ResearchTourOverlay>
  );
}

function CompletionStep({ onFinish }: { onFinish: () => void }) {
  return (
    <ResearchTourOverlay>
      <TourCard>
        <div className="text-center">
          <StepLabel step="complete" />
          <h2 className="mt-3 text-base font-semibold tracking-tight text-white">{RESEARCH_TOUR_COPY.complete.title}</h2>
          <p className="mt-2 text-sm leading-5 text-zinc-500">{RESEARCH_TOUR_COPY.complete.description}</p>
          <button type="button" onClick={onFinish} className="mt-6 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">Start researching</button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

export function ResearchTour({ open, onStart, onSkip }: ResearchTourProps) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<ResearchTourStep>("preferences");

  const finish = useCallback((completed = false) => {
    if (completed) markResearchTourCompleted();
    setStarted(false);
    setStep("preferences");
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setStep("preferences");
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finish, open]);

  return (
    <AnimatePresence>
      {open && (started ? (
        step === "preferences" ? <PreferencesStep onNext={() => setStep("question")} onFinish={() => finish(false)} /> :
        step === "question" ? <QuestionStep onBack={() => setStarted(false)} onNext={() => setStep("paper")} onFinish={() => finish(false)} /> :
        step === "paper" ? <PaperStep onBack={() => setStep("question")} onNext={() => setStep("viewer")} onFinish={() => finish(false)} /> :
        step === "viewer" ? <ViewerStep onBack={() => setStep("paper")} onNext={() => setStep("inference")} onFinish={() => finish(false)} /> :
        step === "inference" ? <InferenceStep onBack={() => setStep("viewer")} onNext={() => setStep("evidence")} onFinish={() => finish(false)} /> :
        step === "evidence" ? <EvidenceStep onBack={() => setStep("inference")} onNext={() => setStep("complete")} onFinish={() => finish(false)} /> :
        <CompletionStep onFinish={() => finish(true)} />
      ) : (
        <ResearchTourWelcome onStart={() => { markResearchTourActive(); setStarted(true); setStep("preferences"); onStart(); }} onSkip={() => finish(false)} />
      ))}
    </AnimatePresence>
  );
}
