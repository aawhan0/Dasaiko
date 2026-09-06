import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
  onFinish,
}: {
  onBack: () => void;
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
  }, []);

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
        className="fixed bottom-8 left-1/2 z-[102] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/[0.09] bg-[#0a0a0a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
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
            onClick={onFinish}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-110"
          >
            Got it
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </ResearchTourOverlay>
  );
}

export function ResearchTour({
  open,
  onStart,
  onSkip,
}: ResearchTourProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!open) {
      setStarted(false);
    }
  }, [open]);

  const finish = () => {
    setStarted(false);
    onSkip();
  };

  return (
    <AnimatePresence>
      {open && (
        started ? (
          <QuestionStep
            onBack={() => setStarted(false)}
            onFinish={finish}
          />
        ) : (
          <ResearchTourWelcome
            onStart={() => {
              setStarted(true);
              onStart();
            }}
            onSkip={onSkip}
          />
        )
      )}
    </AnimatePresence>
  );
}
