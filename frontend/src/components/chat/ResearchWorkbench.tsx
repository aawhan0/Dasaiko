import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import { ChatBlock } from "./ChatBlock";
import { EmptyState } from "./EmptyState";
import { MessageInput } from "./MessageInput";

import { fadeIn } from "@/utils/animations";

export function ResearchWorkbench() {
  const { messages, documents } =
    useWorkspaceStore();

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const isEmpty =
    messages.length === 0 &&
    documents.length === 0;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col flex-1 min-h-0 bg-base overflow-hidden"
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
            <div className="mx-auto w-full max-w-5xl space-y-8">
              {messages.map((message) => (
                <ChatBlock
                  key={message.id}
                  message={message}
                />
              ))}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 px-6 pb-6 pt-3">
            <MessageInput />
          </div>
        </>
      )}
    </motion.div>
  );
}
