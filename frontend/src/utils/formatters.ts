// Formatting utilities for Dasaiko

/** Format bytes into a human-readable string (e.g., "2.3 MB") */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/** Format an ISO date string to a relative "N days ago" label */
export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format a similarity score (0–1) into a percentage string */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Truncate text to a max character count with an ellipsis */
export function truncate(text: string, max = 100): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

/** Return a color class string based on similarity score */
export function scoreColor(score: number): string {
  if (score >= 0.9) return 'text-emerald-400';
  if (score >= 0.75) return 'text-indigo-400';
  if (score >= 0.6) return 'text-amber-400';
  return 'text-zinc-500';
}

/** Return bg color class for score badge */
export function scoreBgColor(score: number): string {
  if (score >= 0.9) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
  if (score >= 0.75) return 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20';
  if (score >= 0.6) return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  return 'bg-zinc-800 text-zinc-500 border-zinc-700';
}
