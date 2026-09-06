import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { ResearchTourOverlay } from "./ResearchTourOverlay";

interface ResearchTourWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

export function ResearchTourWelcome({
  onStart,
  onSkip,
}: ResearchTourWelcomeProps) {
  return (
    <ResearchTourOverlay>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto relative w-full max-w-md rounded-3xl border border-white/[0.09] bg-[#0a0a0a] p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
      >
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tour"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/[0.05] hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08]">
          <img
            src="/assets/brand/dasaiko-mark-white.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
          Research Workspace
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
          Welcome to Dasaiko
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
          See how a question becomes grounded research in about 30 seconds.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500">
          <span>Question</span>
          <ArrowRight className="h-3 w-3 text-zinc-700" />
          <span>Research</span>
          <ArrowRight className="h-3 w-3 text-zinc-700" />
          <span>Evidence</span>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.18)] transition-all duration-200 hover:shadow-[0_0_34px_rgba(99,102,241,0.28)] hover:brightness-110 active:scale-[0.99]"
        >
          Start the tour
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="mt-3 text-[11px] font-medium text-zinc-600 transition hover:text-zinc-400"
        >
          Skip for now
        </button>
      </motion.div>
    </ResearchTourOverlay>
  );
}
