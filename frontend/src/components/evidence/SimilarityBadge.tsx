import { cn } from "@/utils/cn";
import {
  scoreBgColor,
  formatScore,
} from "@/utils/formatters";

interface SimilarityBadgeProps {
  score: number;
  className?: string;
}

export function SimilarityBadge({
  score,
  className,
}: SimilarityBadgeProps) {
  return (
    <span
      className={cn(
        `
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          border
          px-2
          py-1
          font-mono
          text-[9px]
          font-bold
          tracking-tight
        `,
        scoreBgColor(score),
        className,
      )}
    >
      {formatScore(score)}
    </span>
  );
}