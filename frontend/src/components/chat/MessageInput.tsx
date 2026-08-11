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

  // -----------------------------------------
  // Streaming presentation queue
  // -----------------------------------------
  //
  // The backend can deliver chunks much faster
  // than we want to visually render them.
  //
  // We keep the real stream intact, put incoming
  // text into a queue, and reveal it smoothly.
  // This prevents:
  //
  //   receive everything -> animate instantly
  //
  // and also prevents the final response from
  // replacing the streaming message mid-animation.
  // -----------------------------------------

  const streamQueueRef =
    useRef("");

  const streamTimerRef =
    useRef<number | null>(null);

  const streamActiveRef =
    useRef(false);

  const streamDoneRef =
    useRef(false);

  const streamMessageIdRef =
    useRef<string | null>(null);

  const streamFinalResponseRef =
    useRef<Awaited<
      ReturnType<typeof sendQuery>
    > | null>(null);

  const streamErrorRef =
    useRef<unknown>(null);

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


  // -----------------------------------------
  // Smooth streaming renderer
  // -----------------------------------------
  //
  // IMPORTANT:
  // This renderer is started directly when a
  // request begins. It does NOT depend on a React
  // effect being re-triggered by ref changes.
  //
  // That is important because refs do not cause
  // renders. The previous implementation could
  // therefore remain stuck on the streaming
  // indicator while the network request completed.
  // -----------------------------------------

  const startStreamRenderer = (
    messageId: string
  ) => {

    if (
      streamTimerRef.current !== null
    ) {
      return;
    }


    const renderNext = () => {

      const queue =
        streamQueueRef.current;


      // -----------------------------------------
      // Render a small amount from the queue.
      // -----------------------------------------

      if (queue.length > 0) {

        // Keep the reveal readable and steady.
        // 2-4 characters per tick feels much closer
        // to a natural ChatGPT-style response than
        // dumping an entire network chunk at once.
        const visibleCount =
          queue.length > 100
            ? 4
            : queue.length > 40
              ? 3
              : 2;


        const visibleText =
          queue.slice(
            0,
            visibleCount
          );


        streamQueueRef.current =
          queue.slice(
            visibleCount
          );


        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message.id ===
                messageId
                  ? {
                      ...message,
                      content:
                        message.content +
                        visibleText,
                      isStreaming:
                        true,
                    }
                  : message
            )
        );


        streamTimerRef.current =
          window.setTimeout(
            () => {
              streamTimerRef.current =
                null;

              renderNext();
            },
            24
          );

        return;
      }


      // -----------------------------------------
      // Queue is empty.
      //
      // If the backend is still generating, keep
      // polling gently. If it has completed, finish
      // the message.
      // -----------------------------------------

      if (
        streamDoneRef.current
      ) {

        const finalResponse =
          streamFinalResponseRef.current;


        if (finalResponse) {

          setMessages(
            (prev) =>
              prev.map(
                (message) =>
                  message.id ===
                  messageId
                    ? {
                        ...mapChatResponse(
                          finalResponse
                        ),
                        evidence:
                          mapSources(
                            finalResponse
                              .sources ??
                              []
                          ),
                        // Preserve exactly what has
                        // already been visually rendered.
                        content:
                          message.content,
                        isStreaming:
                          false,
                      }
                    : message
              )
          );


          setActiveEvidence(
            mapSources(
              finalResponse.sources ??
                []
            )
          );


          streamActiveRef.current =
            false;

          streamMessageIdRef.current =
            null;

          streamFinalResponseRef.current =
            null;

          setIsQuerying(
            false
          );

          streamTimerRef.current =
            null;

          return;
        }


        if (
          streamErrorRef.current
        ) {

          console.error(
            "Chat Error:",
            streamErrorRef.current
          );


          setActiveEvidence(
            []
          );


          setMessages(
            (prev) =>
              prev.filter(
                (message) =>
                  message.id !==
                  messageId
              )
          );


          streamActiveRef.current =
            false;

          streamMessageIdRef.current =
            null;

          streamErrorRef.current =
            null;

          setIsQuerying(
            false
          );

          streamTimerRef.current =
            null;

          return;
        }
      }


      // No text right now, but the backend may still
      // be generating. Check again without making
      // the UI busy.
      streamTimerRef.current =
        window.setTimeout(
          () => {
            streamTimerRef.current =
              null;

            renderNext();
          },
          24
        );
    };


    streamActiveRef.current =
      true;

    renderNext();
  };


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

      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }


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


      // Reset the presentation queue for this
      // request before starting the network stream.
      streamQueueRef.current = "";
      streamDoneRef.current = false;
      streamActiveRef.current = true;
      streamMessageIdRef.current =
        streamingMessage.id;
      streamFinalResponseRef.current = null;
      streamErrorRef.current = null;


      addMessage(
        streamingMessage
      );


      setIsQuerying(
        true
      );


      // Start the presentation loop immediately.
      // It will wait for network chunks in the queue
      // and consume them continuously as they arrive.
      startStreamRenderer(
        streamingMessage.id
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
          await sendQuery(

            {
              conversation_id:
                conversationId,

              query:
                question,

              selected_document_id:
                selectedDocumentId,

            },

            // -------------------------------------
            // Network chunk -> presentation queue
            // -------------------------------------
            //
            // IMPORTANT:
            // Do not set React message content here.
            // The renderer above consumes this queue
            // at a steady visual rate.
            // -------------------------------------
            (chunk) => {

              streamQueueRef.current +=
                chunk;

            }

          );


        // Keep the final response only for metadata
        // and finalization. The visible text continues
        // from the queue and is never replaced wholesale.
        streamFinalResponseRef.current =
          response;

        streamDoneRef.current =
          true;
      } catch (error) {

        console.error(
          "Chat Error:",
          error
        );

        streamErrorRef.current =
          error;

        streamDoneRef.current =
          true;
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
          className="mb-3 flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.035] px-4 py-3"
        >

          <div className="flex min-w-0 items-center gap-3">

            {/* Check */}

            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">

              <Check
                className="h-3 w-3 text-primary"
                strokeWidth={3}
              />

            </span>


            {/* Context information */}

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-[0.14em] text-primary/60">
                Research context
              </p>

              <p className="mt-0.5 truncate text-xs text-zinc-400">

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
        className="flex items-end gap-2.5 rounded-2xl border border-white/[0.10] bg-surface p-2.5 transition-all focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10"
      >

        {/* Attachment */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="flex-shrink-0 rounded-lg p-2.5 text-zinc-600 transition-colors hover:bg-hover hover:text-zinc-400"
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
          className="min-h-[40px] max-h-[160px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[14px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
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
            "h-10 w-10 flex-shrink-0 rounded-xl transition-all flex items-center justify-center",

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
    </div>
  );
}