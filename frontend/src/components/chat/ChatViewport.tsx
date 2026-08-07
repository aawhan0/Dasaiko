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
        px-6
        pt-6
        pb-6
      "
    >
      <ChatMessageList
        messages={messages}
      />
    </div>
  );
}