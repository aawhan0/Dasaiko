import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, FileText, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/formatters';
import { useUploadStore } from '@/store/useUploadStore';
import type { UploadFile } from '@/types';

function UploadItem({ item }: { item: UploadFile }) {
  const { removeFile } = useUploadStore();

  const icon = {
    uploading: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
    processing: <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />,
    ready: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
  }[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-surface"
    >
      <div className="w-8 h-8 rounded-lg bg-surface border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-zinc-300 truncate mb-1">{item.file.name}</p>
        <div className="flex items-center gap-2">
          {item.status === 'error' ? (
            <p className="text-[11px] text-red-400">{item.errorMessage}</p>
          ) : (
            <>
              <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    item.status === 'ready' ? 'bg-emerald-400' :
                    item.status === 'processing' ? 'bg-amber-400' : 'bg-primary',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] text-zinc-600 font-mono w-8 text-right">{item.progress}%</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {icon}
        {(item.status === 'ready' || item.status === 'error') && (
          <button
            onClick={() => removeFile(item.id)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function UploadProgress() {
  const { queue } = useUploadStore();
  if (queue.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      {queue.map((item) => (
        <UploadItem key={item.id} item={item} />
      ))}
    </div>
  );
}
