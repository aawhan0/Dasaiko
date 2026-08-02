import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { ChatBlock } from './ChatBlock';
import { EmptyState } from './EmptyState';
import { MessageInput } from './MessageInput';
import { fadeIn } from '@/utils/animations';

export function ResearchWorkbench() {
  const { messages, documents } = useWorkspaceStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0 && documents.length === 0;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col h-full min-w-0 bg-base overflow-hidden"
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <ChatBlock key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
          <MessageInput />
        </>
      )}
    </motion.div>
  );
}
