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

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const shouldAutoScroll =
    useRef(true);

  /*
   * Keep track of whether the user is near
   * the bottom of the chat.
   *
   * If they manually scroll upward, we stop
   * forcing the viewport back to the bottom.
   */
  const handleScroll = () => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldAutoScroll.current =
      distanceFromBottom < 80;
  };

  /*
   * Scroll to the bottom when a new message
   * is added, but only if the user hasn't
   * intentionally scrolled upward.
   */
  useEffect(() => {
    const container =
      scrollRef.current;

    if (
      !container ||
      !shouldAutoScroll.current
    ) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  /*
   * During streaming the number of messages
   * does NOT change — only message.content
   * changes.
   *
   * We therefore need to react to the actual
   * message content changing as well.
   */
  useEffect(() => {
    const container =
      scrollRef.current;

    if (
      !container ||
      !shouldAutoScroll.current
    ) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });
  }, [
    messages[
      messages.length - 1
    ]?.content,
  ]);

  const isEmpty =
    messages.length === 0 &&
    documents.length === 0;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="
        flex
        flex-1
        min-h-0
        flex-col
        overflow-hidden
        bg-base
      "
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
              flex-1
              min-h-0
              overflow-y-auto
              px-8
              py-8
            "
          >
            <div className="mx-auto w-full max-w-5xl space-y-8">
              {messages.map(
                (message) => (
                  <ChatBlock
                    key={message.id}
                    message={message}
                  />
                )
              )}
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