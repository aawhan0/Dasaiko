import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

import { RESEARCH_PATH, type ResearchPathStage } from "@/utils/researchPath";

interface ResearchPathProps {
  stage: ResearchPathStage;
}

export function ResearchPath({ stage }: ResearchPathProps) {
  const activeIndex = RESEARCH_PATH.findIndex((item) => item.id === stage);

  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-40 hidden w-[min(720px,70vw)] -translate-x-1/2 md:block">
      <div className="rounded-2xl border border-white/[0.07] bg-[#090909]/90 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          {RESEARCH_PATH.map((item, index) => {
            const complete = index < activeIndex;
            const active = index === activeIndex;
            return (
              <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
                <motion.div
                  animate={{ scale: active ? 1.05 : 1 }}
                  className={active || complete
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white"
                    : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-600"}
                >
                  {complete ? <Check className="h-3.5 w-3.5" /> : active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : <Circle className="h-2.5 w-2.5" />}
                </motion.div>
                <div className="min-w-0">
                  <p className={active ? "truncate text-[10px] font-semibold text-zinc-100" : "truncate text-[10px] font-medium text-zinc-500"}>{item.title}</p>
                </div>
                {index < RESEARCH_PATH.length - 1 && <div className="mx-1 h-px flex-1 bg-white/[0.07]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
