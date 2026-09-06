import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useResearchPreferences } from "@/hooks/useResearchPreferences";

import { ResearchTourOverlay } from "./ResearchTourOverlay";
import { ResearchTourWelcome } from "./ResearchTourWelcome";

interface ResearchTourProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

type TourStep = "preferences" | "question" | "paper" | "viewer" | "inference" | "evidence";

function useTourTarget(selector: string, enabled: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!enabled) {
      setRect(null);
      return;
    }

    const element = document.querySelector<HTMLElement>(selector);

    if (!element) {
      setRect(null);
      return;
    }

    setRect(element.getBoundingClientRect());
  }, [enabled, selector]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    update();

    const observer = new ResizeObserver(update);
    const element = document.querySelector<HTMLElement>(selector);

    if (element) {
      observer.observe(element);
    }

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [enabled, selector, update]);

  return rect;
}

function Spotlight({ rect }: { rect: DOMRect | null }) {
  if (!rect) {
    return null;
  }

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
      className="pointer-events-auto fixed bottom-6 left-1/2 z-[102] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:bottom-8"
    >
      {children}
    </motion.div>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
      {children}
    </span>
  );
}

function PreferencesStep({
  onNext,
  onFinish,
}: {
  onNext: () => void;
  onFinish: () => void;
}) {
  const { preferences, updatePreferences } = useResearchPreferences();
  const [topics, setTopics] = useState(preferences.topics);
  const options = ["RAG", "NLP", "Computer Vision", "LLMs", "Information Retrieval", "Multimodal"];

  const toggle = (topic: string) => {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

  return (
    <ResearchTourOverlay>
      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>1 of 4</StepLabel>
          <button type="button" onClick={onFinish} className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400">Skip tour</button>
        </div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">What are you researching?</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">Pick a few areas. We’ll use them to make the first paper feel relevant.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {options.map((topic) => {
            const selected = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggle(topic)}
                aria-pressed={selected}
                className={selected
                  ? "rounded-xl border border-primary/40 bg-primary/[0.10] px-3 py-2 text-[11px] font-medium text-primary transition"
                  : "rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:border-white/[0.14] hover:text-zinc-300"}
              >
                {topic}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={() => { updatePreferences(topics); onNext(); }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function QuestionStep({
  onBack,
  onNext,
  onFinish,
}: {
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const rect = useTourTarget('[data-tour="research-question"]', true);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />

      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>2 of 4</StepLabel>
          <button
            type="button"
            onClick={onFinish}
            className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400"
          >
            Skip tour
          </button>
        </div>

        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">
          Start with a question.
        </h2>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Ask Dasaiko about the research you want to understand. We’ll guide
          the next step from here.
        </p>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110"
          >
            Show me a paper
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function PaperStep({
  onBack,
  onNext,
  onFinish,
}: {
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const rect = useTourTarget('[data-tour="first-document"]', true);
  const documents = useWorkspaceStore((state) => state.documents);
  const { preferences } = useResearchPreferences();
  const setActiveDocument = useWorkspaceStore((state) => state.setActiveDocument);
  const setSelectedEvidence = useWorkspaceStore((state) => state.setSelectedEvidence);
  const setSelectedPdf = useWorkspaceStore((state) => state.setSelectedPdf);
  const [error, setError] = useState<string | null>(null);

  const recommendedDocument = documents
    .filter((document) => document.status === "ready")
    .map((document) => {
      const haystack = `${document.title} ${document.name} ${document.summary ?? ""}`.toLowerCase();
      const score = preferences.topics.reduce(
        (total, topic) => total + (haystack.includes(topic.toLowerCase()) ? 1 : 0),
        0,
      );
      return { document, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.document;

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(
      '[data-tour="first-document"]',
    );

    if (!target) {
      return;
    }

    const handleClick = () => {
      const documentId = target.dataset.tourDocumentId;
      const firstDocument = documents.find((document) => document.id === documentId) ?? documents[0];

      if (!firstDocument?.filePath) {
        setError(
          documents.length === 0
            ? "Your workspace has no paper to open yet."
            : "This paper is not ready to open yet.",
        );
        return;
      }

      setActiveDocument(firstDocument.id);
      setSelectedEvidence(null);
      setSelectedPdf(firstDocument.filePath);
      onNext();
    };

    target.addEventListener("click", handleClick);

    return () => {
      target.removeEventListener("click", handleClick);
    };
  }, [
    documents,
    onNext,
    setActiveDocument,
    setSelectedEvidence,
    setSelectedPdf,
  ]);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(
      '[data-tour="first-document"]',
    );

    if (target) {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [documents.length]);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />

      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>3 of 4</StepLabel>
          <button
            type="button"
            onClick={onFinish}
            className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400"
          >
            Skip tour
          </button>
        </div>

        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">
          Pick the source you want to explore.
        </h2>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Choose a paper from your workspace. Dasaiko keeps the question tied
          to the evidence you are reading.
        </p>

        {recommendedDocument && preferences.topics.length > 0 && (
          <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/70">Recommended for you</p>
            <p className="mt-1 truncate text-xs font-medium text-zinc-200">{recommendedDocument.title}</p>
            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Based on: {preferences.topics.join(" · ")}</p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 text-[11px] leading-4 text-amber-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            disabled={documents.length === 0}
            onClick={() => {
              const target = document.querySelector<HTMLElement>(
                '[data-tour="first-document"]',
              );

              if (target) {
                target.click();
              } else {
                setError("Your papers are still loading. Try again in a moment.");
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open the paper
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function ViewerStep({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => void;
}) {
  const rect = useTourTarget('[data-tour="paper-viewer"]', true);
  const activeDocumentId = useWorkspaceStore((state) => state.activeDocumentId);
  const documents = useWorkspaceStore((state) => state.documents);

  useEffect(() => {
    const document = documents.find((item) => item.id === activeDocumentId);
    if (!document) return;
    try {
      localStorage.setItem("dasaiko.tourPrompt", `What are the main contributions of "${document.title}" and what evidence supports them?`);
    } catch {
      // The tour remains usable if storage is unavailable.
    }
  }, [activeDocumentId, documents]);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />

      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>4 of 7</StepLabel>
          <button
            type="button"
            onClick={onFinish}
            className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400"
          >
            Skip tour
          </button>
        </div>

        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">
          Keep the paper in context.
        </h2>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          The paper stays beside your research conversation. Ask your question,
          then inspect the retrieved evidence behind the answer.
        </p>

        {!rect && (
          <p className="mt-3 text-[11px] leading-4 text-zinc-600">
            Opening the paper viewer…
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110"
          >
            Try it yourself
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function InferenceStep({
  onBack,
  onNext,
  onFinish,
}: {
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const rect = useTourTarget('[data-tour="research-question"]', true);
  const messages = useWorkspaceStore((state) => state.messages);
  const hasAnswer = messages.some(
    (message) => message.role === "assistant" && Boolean(message.content?.trim()),
  );

  useEffect(() => {
    if (hasAnswer) onNext();
  }, [hasAnswer, onNext]);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>5 of 7</StepLabel>
          <button type="button" onClick={onFinish} className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400">Skip tour</button>
        </div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">Now ask the paper.</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">
          We’ve prepared a question for you. Edit it if you want, then press Ask. Your answer will be grounded in the selected research.
        </p>
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {hasAnswer ? (
            <button type="button" onClick={onNext} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110">
              See the evidence <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-zinc-600">Waiting for your question…</span>
          )}
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

function EvidenceStep({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => void;
}) {
  const rect = useTourTarget('[data-tour="research-evidence"]', true);
  const activeEvidence = useWorkspaceStore((state) => state.activeEvidence);

  return (
    <ResearchTourOverlay>
      <Spotlight rect={rect} />
      <TourCard>
        <div className="flex items-center justify-between">
          <StepLabel>6 of 7</StepLabel>
          <button type="button" onClick={onFinish} className="text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400">Skip tour</button>
        </div>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">Inspect the evidence.</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">
          These sources are the trail behind the answer. Open one to jump back into the relevant part of the paper.
        </p>
        {activeEvidence.length > 0 && (
          <p className="mt-3 text-[10px] text-zinc-600">{activeEvidence.length} evidence source{activeEvidence.length === 1 ? "" : "s"} retrieved.</p>
        )}
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button type="button" onClick={onFinish} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110">
            Finish tour <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </TourCard>
    </ResearchTourOverlay>
  );
}

export function ResearchTour({
  open,
  onStart,
  onSkip,
}: ResearchTourProps) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<TourStep>("question");

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setStep("preferences");
    }
  }, [open]);

  useEffect(() => {
    if (!open || !started) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSkip, open, started]);

  const finish = useCallback(() => {
    setStarted(false);
    setStep("preferences");
    onSkip();
  }, [onSkip]);

  return (
    <AnimatePresence>
      {open &&
        (started ? (
          step === "preferences" ? (
            <PreferencesStep
              onNext={() => setStep("question")}
              onFinish={finish}
            />
          ) : step === "question" ? (
            <QuestionStep
              onBack={() => setStarted(false)}
              onNext={() => setStep("paper")}
              onFinish={finish}
            />
          ) : step === "paper" ? (
            <PaperStep
              onBack={() => setStep("question")}
              onNext={() => setStep("inference")}
              onFinish={finish}
            />
          ) : step === "viewer" ? (
            <ViewerStep
              onBack={() => setStep("paper")}
              onFinish={finish}
            />
          ) : step === "inference" ? (
            <InferenceStep
              onBack={() => setStep("viewer")}
              onNext={() => setStep("evidence")}
              onFinish={finish}
            />
          ) : (
            <EvidenceStep
              onBack={() => setStep("inference")}
              onFinish={finish}
            />
          )
        ) : (
          <ResearchTourWelcome
            onStart={() => {
              setStarted(true);
              setStep("preferences");
              onStart();
            }}
            onSkip={onSkip}
          />
        ))}
    </AnimatePresence>
  );
}
