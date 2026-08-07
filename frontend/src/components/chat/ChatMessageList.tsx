import { ChatBlock } from "./ChatBlock";
import type { ChatMessage } from "@/types";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({
  messages,
}: ChatMessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <ChatBlock
          key={message.id}
          message={message}
        />
      ))}
    </>
  );
}