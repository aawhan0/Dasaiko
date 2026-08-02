import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { fadeInUp } from '@/utils/animations';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white mb-1">{title}</p>
        <p className="text-xs text-zinc-500 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      )}
    </motion.div>
  );
}
