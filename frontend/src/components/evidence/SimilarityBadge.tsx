import { cn } from '@/utils/cn';
import { scoreBgColor, formatScore } from '@/utils/formatters';

interface SimilarityBadgeProps {
  score: number;
  className?: string;
}

export function SimilarityBadge({ score, className }: SimilarityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border',
        scoreBgColor(score),
        className,
      )}
    >
      {formatScore(score)}
    </span>
  );
}
