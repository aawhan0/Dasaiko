import {
  useRef,
  useState,
} from "react";
import {
  motion,
} from "framer-motion";
import {
  Send,
  Paperclip,
  Loader2,
  Check,
} from "lucide-react";

import { useUpload } from "@/hooks/useUpload";
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
      null,
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  /* =====================================================
     STREAMING PRESENTATION QUEUE
  ====================================================== */

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

    selectedDocumentId,
    setSelectedDocumentId,
    documents,
  } = useWorkspaceStore();

  /* =====================================================
     SELECTED PAPER
  ====================================================== */

  const selectedPaper =
    selectedDocumentId !== null
      ? documents.find(
          (document) =>
            Number(document.id) ===
            selectedDocumentId,
        )
      : null;

  /* =====================================================
     CONTEXT PICKER
  ====================================================== */

  const [
    isContextPickerOpen,
    setIsContextPickerOpen,
  ] = useState(false);

  const handleContextChange = (
    documentId: number,
  ) => {
    setSelectedDocumentId(
      documentId,
    );

    setIsContextPickerOpen(false);
  };

  /* =====================================================
     STREAM RENDERER
  ====================================================== */

  const startStreamRenderer = (
    messageId: string,
  ) => {
    if (
      streamTimerRef.current !== null
    ) {
      return;
    }

    const renderNext = () => {
      const queue =
        streamQueueRef.current;

      if (queue.length > 0) {
        const visibleCount =
          queue.length > 100
            ? 4
            : queue.length > 40
              ? 3
              : 2;

        const visibleText =
          queue.slice(
            0,
            visibleCount,
          );

        streamQueueRef.current =
          queue.slice(
            visibleCount,
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
                  : message,
            ),
        );

        streamTimerRef.current =
          window.setTimeout(
            () => {
              streamTimerRef.current =
                null;

              renderNext();
            },
            24,
          );

        return;
      }

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
                          finalResponse,
                        ),
                        evidence:
                          mapSources(
                            finalResponse
                              .sources ??
                              [],
                          ),
                        content:
                          message.content,
                        isStreaming:
                          false,
                      }
                    : message,
              ),
          );

          setActiveEvidence(
            mapSources(
              finalResponse.sources ??
                [],
            ),
          );

          streamActiveRef.current =
            false;

          streamMessageIdRef.current =
            null;

          streamFinalResponseRef.current =
            null;

          setIsQuerying(false);

          streamTimerRef.current =
            null;

          return;
        }

        if (
          streamErrorRef.current
        ) {
          console.error(
            "Chat Error:",
            streamErrorRef.current,
          );

          setActiveEvidence([]);

          setMessages(
            (prev) =>
              prev.filter(
                (message) =>
                  message.id !==
                  messageId,
              ),
          );

          streamActiveRef.current =
            false;

          streamMessageIdRef.current =
            null;

          streamErrorRef.current =
            null;

          setIsQuerying(false);

          streamTimerRef.current =
            null;

          return;
        }
      }

      streamTimerRef.current =
        window.setTimeout(
          () => {
            streamTimerRef.current =
              null;

            renderNext();
          },
          24,
        );
    };

    streamActiveRef.current =
      true;

    renderNext();
  };

  /* =====================================================
     SUBMIT
  ====================================================== */

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

      /* -----------------------------------------------
         Context-change command
      ------------------------------------------------ */

      const normalizedQuestion =
        question
          .toLowerCase()
          .replace(
            /[?.!,]/g,
            "",
          )
          .replace(
            /\s+/g,
            " ",
          )
          .trim();

      const isContextChangeCommand =
        normalizedQuestion ===
          "change the context" ||
        normalizedQuestion ===
          "change context" ||
        normalizedQuestion ===
          "change the research context" ||
        normalizedQuestion ===
          "change the paper" ||
        normalizedQuestion ===
          "change paper" ||
        normalizedQuestion ===
          "switch the context" ||
        normalizedQuestion ===
          "switch context" ||
        normalizedQuestion ===
          "switch the paper" ||
        normalizedQuestion ===
          "switch paper" ||
        normalizedQuestion ===
          "choose another paper" ||
        normalizedQuestion ===
          "select another paper" ||
        normalizedQuestion ===
          "choose a different paper" ||
        normalizedQuestion ===
          "select a different paper" ||
        normalizedQuestion ===
          "use another paper" ||
        normalizedQuestion ===
          "use a different paper";

      if (
        isContextChangeCommand
      ) {
        setValue("");

        if (textareaRef.current) {
          textareaRef.current.style.height =
            "44px";
        }

        setIsContextPickerOpen(
          true,
        );

        return;
      }

      if (
        !activeConversationId
      ) {
        console.error(
          "No active conversation selected.",
        );

        return;
      }

      const conversationId =
        Number(
          activeConversationId,
        );

      if (
        Number.isNaN(
          conversationId,
        )
      ) {
        console.error(
          "Invalid conversation id:",
          activeConversationId,
        );

        return;
      }

      setValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height =
          "44px";
      }

      /* -----------------------------------------------
         User message
      ------------------------------------------------ */

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: question,
        timestamp:
          new Date().toISOString(),
      };

      addMessage(
        userMessage,
      );

      /* -----------------------------------------------
         Streaming placeholder
      ------------------------------------------------ */

      const streamingMessage = {
        id: `stream-${Date.now()}`,
        role: "assistant" as const,
        content: "",
        timestamp:
          new Date().toISOString(),
        isStreaming: true,
      };

      streamQueueRef.current =
        "";

      streamDoneRef.current =
        false;

      streamActiveRef.current =
        true;

      streamMessageIdRef.current =
        streamingMessage.id;

      streamFinalResponseRef.current =
        null;

      streamErrorRef.current =
        null;

      addMessage(
        streamingMessage,
      );

      setIsQuerying(true);

      startStreamRenderer(
        streamingMessage.id,
      );

      try {
        const response =
          await sendQuery(
            {
              conversation_id:
                conversationId,

              query: question,

              selected_document_id:
                selectedDocumentId,
            },

            (chunk) => {
              streamQueueRef.current +=
                chunk;
            },
          );

        streamFinalResponseRef.current =
          response;

        streamDoneRef.current =
          true;
      } catch (error) {
        console.error(
          "Chat Error:",
          error,
        );

        streamErrorRef.current =
          error;

        streamDoneRef.current =
          true;
      }
    };

  /* =====================================================
     KEYBOARD
  ====================================================== */

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSubmit();
    }
  };

  /* =====================================================
     TEXTAREA
  ====================================================== */

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setValue(
      e.target.value,
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
        160,
      )}px`;
  };

  return (
    <div
      className="
        w-full
      "
    >
      {/* =================================================
          RESEARCH CONTEXT
      ================================================== */}

      {selectedDocumentId !== null && (
        <>
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
            className="
              mb-3
              flex
              items-center
              justify-between
              rounded-xl
              border-[1.5px]
              border-primary/15
              bg-primary/[0.035]
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-primary/20
                  bg-primary/10
                "
              >
                <Check
                  className="
                    h-3
                    w-3
                    text-primary
                  "
                  strokeWidth={3}
                />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-primary/70
                  "
                >
                  Research context
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[12px]
                    font-semibold
                    text-zinc-300
                  "
                >
                  {selectedPaper?.title ??
                    "Selected paper"}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={
                isQuerying
              }
              onClick={() =>
                setIsContextPickerOpen(
                  (open) =>
                    !open,
                )
              }
              className="
                ml-3
                shrink-0
                rounded-lg
                border
                border-transparent
                px-2.5
                py-1.5
                text-[10px]
                font-bold
                text-primary
                transition-all
                hover:border-primary/15
                hover:bg-primary/10
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isContextPickerOpen
                ? "Close"
                : "Change"}
            </button>
          </motion.div>

          {/* =================================================
              CONTEXT PICKER
          ================================================== */}

          {isContextPickerOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.15,
              }}
              className="
                mb-3
                overflow-hidden
                rounded-xl
                border-[1.5px]
                border-white/[0.10]
                bg-[#0B0B0B]
                shadow-[0_12px_35px_rgba(0,0,0,0.25)]
              "
            >
              <div
                className="
                  border-b
                  border-white/[0.07]
                  px-4
                  py-3.5
                "
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-primary/70
                  "
                >
                  Change research context
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-medium
                    leading-5
                    text-zinc-500
                  "
                >
                  Choose the paper you want
                  to use for this conversation.
                </p>
              </div>

              <div
                className="
                  max-h-56
                  overflow-y-auto
                  p-2
                "
              >
                {documents.length ===
                0 ? (
                  <p
                    className="
                      px-3
                      py-4
                      text-xs
                      font-medium
                      text-zinc-500
                    "
                  >
                    No uploaded papers
                    available.
                  </p>
                ) : (
                  documents.map(
                    (document) => {
                      const documentId =
                        Number(
                          document.id,
                        );

                      const isSelected =
                        documentId ===
                        selectedDocumentId;

                      return (
                        <button
                          key={
                            document.id
                          }
                          type="button"
                          disabled={
                            isSelected
                          }
                          onClick={() =>
                            handleContextChange(
                              documentId,
                            )
                          }
                          className={cn(
                            `
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-lg
                              border
                              px-3
                              py-2.5
                              text-left
                              text-xs
                              font-medium
                              transition-all
                            `,

                            isSelected
                              ? `
                                border-primary/20
                                bg-primary/[0.08]
                                text-zinc-200
                              `
                              : `
                                border-transparent
                                text-zinc-500
                                hover:border-white/[0.08]
                                hover:bg-white/[0.04]
                                hover:text-zinc-200
                              `,
                          )}
                        >
                          <span
                            className={cn(
                              `
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                              `,

                              isSelected
                                ? `
                                  border-primary/30
                                  bg-primary/10
                                `
                                : `
                                  border-white/[0.12]
                                `,
                            )}
                          >
                            {isSelected && (
                              <Check
                                className="
                                  h-3
                                  w-3
                                  text-primary
                                "
                                strokeWidth={
                                  3
                                }
                              />
                            )}
                          </span>

                          <span
                            className="
                              min-w-0
                              flex-1
                              truncate
                            "
                          >
                            {document.title ??
                              "Untitled document"}
                          </span>
                        </button>
                      );
                    },
                  )
                )}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* =================================================
          INPUT
      ================================================== */}

      <motion.div
        initial={{
          y: 8,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="
          group
          flex
          items-end
          gap-2.5
          rounded-2xl
          border-[1.5px]
          border-white/[0.11]
          bg-[#0B0B0B]
          p-2.5
          shadow-[0_8px_30px_rgba(0,0,0,0.18)]
          transition-all
          duration-200
          focus-within:border-primary/35
          focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.06),0_12px_35px_rgba(0,0,0,0.22)]
        "
      >
        {/* =================================================
            ATTACHMENT
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isQuerying}
          aria-label="Attach document"
          title="Attach document"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-transparent
            text-zinc-600
            transition-all
            duration-200
            hover:border-white/[0.08]
            hover:bg-white/[0.05]
            hover:text-zinc-300
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Paperclip
            className="
              h-4
              w-4
            "
          />
        </button>

        {/* =================================================
            TEXTAREA
        ================================================== */}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedDocumentId !== null
              ? "Ask about this research context..."
              : "Ask a question about your documents..."
          }
          rows={1}
          disabled={isQuerying}
          className="
            min-h-[44px]
            max-h-[160px]
            flex-1
            resize-none
            bg-transparent
            px-1.5
            py-2.5
            text-[14px]
            font-medium
            leading-6
            text-zinc-200
            placeholder:text-zinc-500
            focus:outline-none
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />

        {/* =================================================
            SEND
        ================================================== */}

        <motion.button
          type="button"
          whileHover={{
            scale: value.trim() &&
              !isQuerying
              ? 1.03
              : 1,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={handleSubmit}
          disabled={
            !value.trim() ||
            isQuerying
          }
          aria-label="Send research query"
          title="Send"
          className={cn(
            `
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition-all
              duration-200
            `,

            value.trim() &&
              !isQuerying
              ? `
                border-primary/30
                bg-primary
                text-white
                shadow-[0_0_20px_rgba(99,102,241,0.16)]
                hover:bg-primary/90
                hover:shadow-[0_0_26px_rgba(99,102,241,0.22)]
              `
              : `
                border-white/[0.05]
                bg-white/[0.035]
                text-zinc-600
              `,
          )}
        >
          {isQuerying ? (
            <Loader2
              className="
                h-4
                w-4
                animate-spin
              "
            />
          ) : (
            <Send
              className="
                h-4
                w-4
                stroke-[2.2]
              "
            />
          )}
        </motion.button>

        {/* =================================================
            HIDDEN FILE INPUT
        ================================================== */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          multiple
          className="hidden"
          onChange={(e) => {
            onFileInputChange(e);
            e.target.value = "";
          }}
        />
      </motion.div>
    </div>
  );
}