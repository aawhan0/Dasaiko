import { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Database } from 'lucide-react';
import { fadeInUp } from '@/utils/animations';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StreamingIndicator } from './StreamingIndicator';
import { formatRelativeDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { ChatMessage } from '@/types';

interface ChatBlockProps {
  message: ChatMessage;
  onEvidenceClick?: () => void;
}

export const ChatBlock = memo(function ChatBlock({ message, onEvidenceClick }: ChatBlockProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn('flex gap-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border',
        isUser
          ? 'bg-zinc-800 border-white/[0.08]'
          : 'bg-primary/10 border-primary/20',
      )}>
        {isUser
          ? <User className="w-4 h-4 text-zinc-400" aria-label="User Avatar" />
          : <Sparkles className="w-4 h-4 text-primary" aria-label="AI Avatar" />
        }
      </div>

      <div className={cn('flex-1 min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-[14px]',
          isUser
            ? 'bg-surface border border-white/[0.08] text-zinc-300 rounded-tr-sm'
            : 'text-zinc-300 rounded-tl-sm',
        )}>
          {message.isStreaming ? (
            <StreamingIndicator />
          ) : isUser ? (
            <p>{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        <div className={cn(
          'flex items-center gap-3 mt-1.5 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row',
        )}>
          <span className="text-[10px] text-zinc-700 font-mono">
            {formatRelativeDate(message.timestamp)}
          </span>
          {!isUser && message.evidence && message.evidence.length > 0 && (
            <button
              onClick={onEvidenceClick}
              className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-primary transition-colors"
              aria-label={`View ${message.evidence.length} sources`}
            >
              <Database className="w-3 h-3" />
              {message.evidence.length} source{message.evidence.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
