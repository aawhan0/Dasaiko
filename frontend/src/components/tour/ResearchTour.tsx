import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ResearchTourOverlay } from "./ResearchTourOverlay";
import { ResearchTourWelcome } from "./ResearchTourWelcome";

interface ResearchTourProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
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
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const update = () => {
      const element = document.querySelector(
        '[data-tour="research-question"]',
      );

      setRect(element?.getBoundingClientRect() ?? null);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [onNext]);

  const spotlightStyle = rect
    ? {
        left: rect.left - 8,
        top: rect.top - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }
    : undefined;

  return (
    <ResearchTourOverlay>
      {rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none fixed z-[101] rounded-2xl border border-primary/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_34px_rgba(99,102,241,0.20)]"
          style={spotlightStyle}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="pointer-events-auto fixed bottom-8 left-1/2 z-[102] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            1 of 3
          </span>

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
      </motion.div>
    </ResearchTourOverlay>
  );
}

function PaperStep({ onBack, onNext, onFinish }: { onBack: () => void; onNext: () => void; onFinish: () => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const update = () => {
      const element = document.querySelector('[data-tour="first-document"]');
      setRect(element?.getBoundingClientRect() ?? null);
    };
    update();
    const target = document.querySelector('[data-tour="first-document"]');
    target?.addEventListener("click", onNext);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      target?.removeEventListener("click", onNext);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [onNext]);

  const spotlightStyle = rect
    ? { left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 }
    : undefined;

  return (
    <ResearchTourOverlay>
      {rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none fixed z-[101] rounded-2xl border border-primary/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_34px_rgba(99,102,241,0.20)]"
          style={spotlightStyle}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto fixed bottom-8 left-1/2 z-[102] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">2 of 3</span>
        <h2 className="mt-3 text-base font-semibold tracking-tight text-white">Pick the source you want to explore.</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-500">Choose a paper from your workspace. Dasaiko keeps the question tied to the evidence you are reading.</p>
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"><ArrowLeft className="h-3.5 w-3.5" />Back</button>
          <button type="button" onClick={onNext} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110">Open the paper <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </motion.div>
    </ResearchTourOverlay>
  );
}


function ViewerStep({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    const update = () => {
      const element = document.querySelector('[data-tour="paper-viewer"]');
      setRect(element?.getBoundingClientRect() ?? null);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  const spotlightStyle = rect ? { left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 } : undefined;
  return <ResearchTourOverlay>
    {rect && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="pointer-events-none fixed z-[101] rounded-2xl border border-primary/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_34px_rgba(99,102,241,0.20)]" style={spotlightStyle} />}
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="pointer-events-auto fixed bottom-8 left-1/2 z-[102] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">3 of 3</span>
      <h2 className="mt-3 text-base font-semibold tracking-tight text-white">Keep the paper in context.</h2>
      <p className="mt-2 text-sm leading-5 text-zinc-500">The paper stays beside your research conversation. Ask your question, then inspect the retrieved evidence behind the answer.</p>
      <div className="mt-5 flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"><ArrowLeft className="h-3.5 w-3.5" />Back</button>
        <button type="button" onClick={onFinish} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110">Try it yourself <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
    </motion.div>
  </ResearchTourOverlay>;
}

export function ResearchTour({
  open,
  onStart,
  onSkip,
}: ResearchTourProps) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<"question" | "paper" | "viewer">("question");

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setStep("question");
    }
  }, [open]);

  const finish = () => {
    setStarted(false);
    setStep("question");
    onSkip();
  };

  return (
    <AnimatePresence>
      {open &&
        (started ? (
          step === "question" ? (
            <QuestionStep
              onBack={() => setStarted(false)}
              onNext={() => setStep("paper")}
              onFinish={finish}
            />
          ) : step === "paper" ? (
            <PaperStep
              onBack={() => setStep("question")}
              onNext={() => setStep("viewer")}
              onFinish={finish}
            />
          ) : (
            <ViewerStep
              onBack={() => setStep("paper")}
              onFinish={finish}
            />
          )
        ) : (
          <ResearchTourWelcome
            onStart={() => {
              setStarted(true);
              onStart();
            }}
            onSkip={onSkip}
          />
        ))}
    </AnimatePresence>
  );
}