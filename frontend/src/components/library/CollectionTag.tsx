import { cn } from '@/utils/cn';
import type { CollectionColor } from '@/types';

const colorMap: Record<CollectionColor, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const dotMap: Record<CollectionColor, string> = {
  indigo: 'bg-indigo-400',
  purple: 'bg-purple-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
};

interface CollectionTagProps {
  name: string;
  color: CollectionColor;
  className?: string;
  showDot?: boolean;
}

export function CollectionTag({ name, color, className, showDot = true }: CollectionTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border',
        colorMap[color],
        className,
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', dotMap[color])} />}
      {name}
    </span>
  );
}
