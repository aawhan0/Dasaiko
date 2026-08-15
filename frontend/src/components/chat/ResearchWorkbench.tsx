import {
  useRef,
  useEffect,
} from "react";
import { motion } from "framer-motion";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import { ChatBlock } from "./ChatBlock";
import { EmptyState } from "./EmptyState";
import { MessageInput } from "./MessageInput";

import { fadeIn } from "@/utils/animations";

export function ResearchWorkbench() {
  const {
    messages,
    documents,
  } = useWorkspaceStore();

  const scrollRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const shouldAutoScroll =
    useRef(true);

  /* =====================================================
     SCROLL POSITION
  ====================================================== */

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

  /* =====================================================
     SCROLL WHEN MESSAGE COUNT CHANGES
  ====================================================== */

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

  /* =====================================================
     SCROLL DURING STREAMING
  ====================================================== */

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

  /* =====================================================
     EMPTY WORKSPACE
  ====================================================== */

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
        min-h-0
        flex-1
        flex-col
        overflow-hidden
        bg-base
      "
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* =================================================
              CONVERSATION
          ================================================== */}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
              min-h-0
              flex-1
              overflow-y-auto

              px-5
              py-7

              sm:px-7
              sm:py-8

              lg:px-8
              lg:py-9

              [scrollbar-width:thin]
              [scrollbar-color:rgba(255,255,255,0.10)_transparent]
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-4xl
                space-y-8
              "
            >
              {messages.map(
                (message) => (
                  <ChatBlock
                    key={
                      message.id
                    }
                    message={
                      message
                    }
                  />
                ),
              )}
            </div>
          </div>

          {/* =================================================
              COMPOSER AREA
          ================================================== */}

          <div
            className="
              relative
              shrink-0
              bg-base

              px-5
              pb-5
              pt-3

              sm:px-7
              sm:pb-6

              lg:px-8
            "
          >
            {/* Subtle separation from conversation */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/[0.06]
                to-transparent
              "
            />

            <div
              className="
                mx-auto
                w-full
                max-w-4xl
              "
            >
              <MessageInput />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}