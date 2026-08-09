import { useState, useRef } from "react";
import { useUpload } from "@/hooks/useUpload";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Loader2,
  Check,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { sendQuery } from "@/services/chat";

import {
  mapChatResponse,
  mapSources,
} from "@/mappers/chatMapper";


export function MessageInput() {

  const [value, setValue] =
    useState("");

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const { onFileInputChange } =
    useUpload();


  const {
    isQuerying,
    setIsQuerying,
    addMessage,
    setMessages,
    setActiveEvidence,
    activeConversationId,

    // -----------------------------------------
    // Conversation research context
    // -----------------------------------------
    selectedDocumentId,
    documents,

  } = useWorkspaceStore();


  // -----------------------------------------
  // Find currently selected paper
  // -----------------------------------------

  const selectedPaper =
    selectedDocumentId !== null
      ? documents.find(
          (document) =>
            Number(document.id) ===
            selectedDocumentId
        )
      : null;


  const handleSubmit =
    async () => {

      const question =
        value.trim();


      if (
        !question ||
        isQuerying
      ) {
        return;
      }


      if (!activeConversationId) {

        console.error(
          "No active conversation selected."
        );

        return;
      }


      const conversationId =
        Number(
          activeConversationId
        );


      if (
        Number.isNaN(
          conversationId
        )
      ) {

        console.error(
          "Invalid conversation id:",
          activeConversationId
        );

        return;
      }


      console.log(
        "================================="
      );

      console.log(
        "ACTIVE:",
        activeConversationId
      );

      console.log(
        "NUMERIC:",
        conversationId
      );

      console.log(
        "QUESTION:",
        question
      );

      console.log(
        "RESEARCH CONTEXT:",
        selectedDocumentId
      );

      console.log(
        "================================="
      );


      setValue("");


      // -----------------------------------------
      // User Message
      // -----------------------------------------

      const userMessage = {

        id:
          `user-${Date.now()}`,

        role:
          "user" as const,

        content:
          question,

        timestamp:
          new Date().toISOString(),
      };


      addMessage(
        userMessage
      );


      // -----------------------------------------
      // Streaming Placeholder
      // -----------------------------------------

      const streamingMessage = {

        id:
          `stream-${Date.now()}`,

        role:
          "assistant" as const,

        content:
          "",

        timestamp:
          new Date().toISOString(),

        isStreaming:
          true,
      };


      addMessage(
        streamingMessage
      );


      setIsQuerying(
        true
      );


      try {

        // -----------------------------------------
        // Chat Request
        // -----------------------------------------
        //
        // The selected document remains attached
        // to the conversation context.
        //
        // It is NOT cleared after this request.
        // -----------------------------------------

        const response =
          await sendQuery({

            conversation_id:
              conversationId,

            query:
              question,

            selected_document_id:
              selectedDocumentId,

          });


        // -----------------------------------------
        // Assistant Message
        // -----------------------------------------

        const assistantMessage = {

          ...mapChatResponse(
            response
          ),

          evidence:
            mapSources(
              response.sources ??
                []
            ),
        };


        setMessages(
          (prev) => {

            const withoutStreaming =
              prev.filter(
                (msg) =>
                  !msg.isStreaming
              );


            return [
              ...withoutStreaming,
              assistantMessage,
            ];
          }
        );


        // -----------------------------------------
        // Evidence Vault
        // -----------------------------------------

        setActiveEvidence(
          mapSources(
            response.sources ??
              []
          )
        );


      } catch (error) {

        console.error(
          "Chat Error:",
          error
        );


        // Clear stale evidence

        setActiveEvidence(
          []
        );


        // Remove streaming placeholder

        setMessages(
          (prev) =>
            prev.filter(
              (msg) =>
                !msg.isStreaming
            )
        );


      } finally {

        setIsQuerying(
          false
        );

      }
    };


  // -----------------------------------------
  // Keyboard
  // -----------------------------------------

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSubmit();

    }
  };


  // -----------------------------------------
  // Textarea
  // -----------------------------------------

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {

    setValue(
      e.target.value
    );


    const textarea =
      textareaRef.current;


    if (!textarea) {
      return;
    }


    textarea.style.height =
      "auto";


    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        160
      )}px`;
  };


  return (

    <div>

      {/* --------------------------------------- */}
      {/* Research Context                        */}
      {/* --------------------------------------- */}

      {selectedDocumentId !== null && (

        <motion.div
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="mb-2 flex items-center justify-between rounded-lg border border-primary/10 bg-primary/[0.035] px-3 py-2"
        >

          <div className="flex min-w-0 items-center gap-2">

            {/* Check */}

            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">

              <Check
                className="h-2.5 w-2.5 text-primary"
                strokeWidth={3}
              />

            </span>


            {/* Context information */}

            <div className="min-w-0">

              <p className="text-[9px] uppercase tracking-wider text-primary/60">
                Research context
              </p>

              <p className="truncate text-[11px] text-zinc-400">

                {selectedPaper?.title ??
                  "Selected paper"}

              </p>

            </div>

          </div>

        </motion.div>

      )}


      {/* --------------------------------------- */}
      {/* Input                                   */}
      {/* --------------------------------------- */}

      <motion.div
        initial={{
          y: 8,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="flex items-end gap-2 bg-surface border border-white/[0.10] rounded-2xl p-2 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all"
      >

        {/* Attachment */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="p-2 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-hover transition-colors flex-shrink-0"
        >

          <Paperclip
            className="w-4 h-4"
          />

        </button>


        {/* Textarea */}

        <textarea
          ref={
            textareaRef
          }
          value={
            value
          }
          onChange={
            handleInput
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            selectedDocumentId !== null
              ? "Ask about this research context..."
              : "Ask a question about your documents..."
          }
          rows={1}
          disabled={
            isQuerying
          }
          className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none py-1.5 px-1 min-h-[36px] max-h-[160px] disabled:opacity-50"
        />


        {/* Send */}

        <motion.button
          type="button"
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={
            handleSubmit
          }
          disabled={
            !value.trim() ||
            isQuerying
          }
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",

            value.trim() &&
              !isQuerying

              ? "bg-primary hover:bg-primary/90 text-white"

              : "bg-white/[0.04] text-zinc-600"
          )}
        >

          {isQuerying ? (

            <Loader2
              className="w-4 h-4 animate-spin"
            />

          ) : (

            <Send
              className="w-4 h-4"
            />

          )}

        </motion.button>


        {/* Hidden file input */}

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          multiple
          className="hidden"
          onChange={(e) => {

            onFileInputChange(
              e
            );

            e.target.value =
              "";

          }}
        />

      </motion.div>


      {/* --------------------------------------- */}
      {/* Keyboard hint                           */}
      {/* --------------------------------------- */}

      <p className="text-[10px] text-zinc-700 text-center mt-2">
        Shift + Enter for new line ·
        Enter to send
      </p>

    </div>
  );
}