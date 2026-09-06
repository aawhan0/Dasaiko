import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ResearchTourOverlayProps {
  children: ReactNode;
}

export function ResearchTourOverlay({
  children,
}: ResearchTourOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-none contents">{children}</div>
    </motion.div>
  );
}
