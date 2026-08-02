import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileType, Plus } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { UploadProgress } from './UploadProgress';
import { ACCEPTED_EXTENSIONS } from '@/utils/fileHelpers';
import { cn } from '@/utils/cn';

export function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragOver, onDrop, onDragOver, onDragLeave, onFileInputChange } = useUpload();

  return (
    <div className="w-full">
      <motion.div
        animate={isDragOver ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center gap-5 p-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer group',
          isDragOver
            ? 'border-primary/60 bg-primary/5'
            : 'border-white/[0.08] hover:border-white/20 hover:bg-hover',
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Background glow when dragging */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-primary/[0.03] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          animate={isDragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors',
            isDragOver
              ? 'bg-primary/15 border-primary/30'
              : 'bg-surface border-white/[0.08] group-hover:border-white/15',
          )}
        >
          {isDragOver ? (
            <Upload className="w-7 h-7 text-primary" />
          ) : (
            <FileType className="w-7 h-7 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
          )}
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <p className={cn(
            'text-[15px] font-semibold mb-1.5 transition-colors',
            isDragOver ? 'text-white' : 'text-zinc-300',
          )}>
            {isDragOver ? 'Drop to upload' : 'Upload your documents'}
          </p>
          <p className="text-[13px] text-zinc-600">
            Drag & drop PDFs, docs or text files here
          </p>
          <p className="text-[11px] text-zinc-700 mt-1 font-mono">
            {ACCEPTED_EXTENSIONS.join('  ')}
          </p>
        </div>

        {/* Browse button */}
        {!isDragOver && (
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[13px] font-medium hover:bg-primary/15 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Browse files
          </motion.span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={onFileInputChange}
          className="hidden"
        />
      </motion.div>

      <UploadProgress />
    </div>
  );
}
