import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { sendQuery } from "@/services/chat";

import {
  mapChatResponse,
  mapSources,
} from "@/mappers/chatMapper";

export function MessageInput() {
  const [value, setValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isQuerying,
    setIsQuerying,
    addMessage,
    setMessages,
    setActiveEvidence,
    activeConversationId,
  } = useWorkspaceStore();

  const handleSubmit = async () => {
    const question = value.trim();

    if (!question || isQuerying) return;

    setValue("");

    // -----------------------------
    // User Message
    // -----------------------------
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: question,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);

    // -----------------------------
    // Temporary Streaming Message
    // -----------------------------
    const streamingMessage = {
      id: `stream-${Date.now()}`,
      role: "assistant" as const,
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    addMessage(streamingMessage);

    setIsQuerying(true);

    try {
      const response = await sendQuery({
        conversation_id: Number(activeConversationId),
        query: question,
      });

      // Convert backend -> UI
      const assistantMessage = mapChatResponse(response);

      const evidence = mapSources(response.sources);

      // Replace streaming message
      setMessages((prev) => {
        const withoutStreaming = prev.filter(
          (msg) => !msg.isStreaming
        );

        return [
          ...withoutStreaming,
          assistantMessage,
        ];
      });

      setActiveEvidence(evidence);
    } catch (error) {
      console.error("Chat Error:", error);

      // Remove streaming message on error
      setMessages((prev) =>
        prev.filter((msg) => !msg.isStreaming)
      );
    } finally {
      setIsQuerying(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setValue(e.target.value);

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160
    )}px`;
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] flex-shrink-0">
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-end gap-2 bg-surface border border-white/[0.10] rounded-2xl p-2 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all"
      >
        <button
          className="p-2 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-hover transition-colors flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          rows={1}
          disabled={isQuerying}
          className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none py-1.5 px-1 min-h-[36px] max-h-[160px] disabled:opacity-50"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!value.trim() || isQuerying}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
            value.trim() && !isQuerying
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-white/[0.04] text-zinc-600"
          )}
        >
          {isQuerying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </motion.div>

      <p className="text-[10px] text-zinc-700 text-center mt-2">
        Shift + Enter for new line · Enter to send
      </p>
    </div>
  );
}