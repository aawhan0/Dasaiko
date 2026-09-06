import { AnimatePresence } from "framer-motion";
import { ResearchTourWelcome } from "./ResearchTourWelcome";

interface ResearchTourProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function ResearchTour({
  open,
  onStart,
  onSkip,
}: ResearchTourProps) {
  return (
    <AnimatePresence>
      {open && (
        <ResearchTourWelcome
          onStart={onStart}
          onSkip={onSkip}
        />
      )}
    </AnimatePresence>
  );
}
