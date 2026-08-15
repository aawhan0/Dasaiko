import { useEffect, useRef } from "react";

import { ChatMessageList } from "./ChatMessageList";

import type { ChatMessage } from "@/types";

interface ChatViewportProps {
  messages: ChatMessage[];
}

export function ChatViewport({
  messages,
}: ChatViewportProps) {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      className="
        flex-1
        min-h-0
        overflow-y-auto
        scroll-smooth

        px-6
        py-7

        sm:px-7
        sm:py-8

        lg:px-10
        lg:py-9

        bg-base

        selection:bg-primary/20
        selection:text-white

        [scrollbar-width:thin]
        [scrollbar-color:rgba(255,255,255,0.10)_transparent]
      "
    >
      <ChatMessageList
        messages={messages}
      />
    </div>
  );
}