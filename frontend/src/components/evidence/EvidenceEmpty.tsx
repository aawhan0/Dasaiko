import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
} from "lucide-react";

import { fadeInUp } from "@/utils/animations";

export function EvidenceEmpty() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
    >
      {/* =================================================
          ICON
      ================================================== */}

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border-[1.5px]
          border-white/[0.08]
          bg-white/[0.025]
        "
      >
        <BookOpen
          className="
            h-4
            w-4
            text-zinc-500
          "
        />
      </div>

      {/* =================================================
          TITLE
      ================================================== */}

      <h3
        className="
          mt-4
          text-[12px]
          font-bold
          tracking-tight
          text-zinc-300
        "
      >
        No evidence yet
      </h3>

      {/* =================================================
          DESCRIPTION
      ================================================== */}

      <p
        className="
          mt-2
          max-w-[230px]
          text-[10px]
          font-medium
          leading-5
          text-zinc-600
        "
      >
        Ask a question about your uploaded
        research. Relevant passages will
        appear here.
      </p>

      {/* =================================================
          SIGNAL
      ================================================== */}

      <div
        className="
          mt-5
          flex
          items-center
          gap-2
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-zinc-600
        "
      >
        <Sparkles
          className="
            h-3
            w-3
            text-primary/50
          "
        />

        Evidence-backed answers
      </div>
    </motion.div>
  );
}