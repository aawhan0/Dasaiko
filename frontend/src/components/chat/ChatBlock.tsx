import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Check,
  BookOpen,
} from "lucide-react";

import { fadeInUp } from "@/utils/animations";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { StreamingIndicator } from "./StreamingIndicator";
import { cn } from "@/utils/cn";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import { sendQuery } from "@/services/chat";

import {
  mapChatResponse,
  mapSources,
} from "@/mappers/chatMapper";

import type { ChatMessage } from "@/types";


interface ChatBlockProps {
  message: ChatMessage;
  onEvidenceClick?: () => void;
}


export const ChatBlock = memo(
  function ChatBlock({
    message,
    onEvidenceClick,
  }: ChatBlockProps) {

    const isUser =
      message.role === "user";

    const {
      selectedDocumentId,
      setSelectedDocumentId,
      documents,
      messages,
      activeConversationId,
      addMessage,
      setMessages,
      setActiveEvidence,
      isQuerying,
      setIsQuerying,
    } = useWorkspaceStore();


    const handlePaperSelect = async (
      documentId: number
    ) => {

      if (
        selectedDocumentId ===
        documentId
      ) {
        return;
      }

      if (isQuerying) {
        return;
      }


      // The paper-selection assistant message is
      // immediately after the original user question.
      // Recover that question so the user never has
      // to ask it again.
      const messageIndex =
        messages.findIndex(
          (item) =>
            item.id === message.id
        );


      const originalQuestion =
        messageIndex >= 0
          ? [
              ...messages.slice(
                0,
                messageIndex
              ),
            ]
              .reverse()
              .find(
                (item) =>
                  item.role ===
                  "user"
              )
          : undefined;


      if (
        !originalQuestion ||
        !activeConversationId
      ) {

        console.error(
          "Could not recover the original question for paper selection."
        );

        return;
      }


      setSelectedDocumentId(
        documentId
      );

      const selectedDocument =
        documents.find(
          (document) =>
            Number(document.id) ===
            documentId
        );

      // Add the historical context-selection event
      // immediately, at the exact position where the
      // user selected the paper. The backend persists
      // the same event, so it will be reconstructed
      // here after a reload.
      addMessage({
        id:
          `research-context-${documentId}-${Date.now()}`,
        role: "research_context",
        content:
          selectedDocument?.title ??
          "Selected research paper",
        timestamp:
          new Date().toISOString(),
      });


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


      const streamingId =
        `stream-selection-${Date.now()}`;


      addMessage({
        id: streamingId,
        role: "assistant",
        content: "",
        timestamp:
          new Date().toISOString(),
        isStreaming: true,
      });


      setIsQuerying(true);


      try {

        const response =
          await sendQuery(
            {
              conversation_id:
                conversationId,

              query:
                originalQuestion.content,

              selected_document_id:
                documentId,

              selection_continuation:
                true,
            },
            (chunk) => {
              setMessages(
                (previous) =>
                  previous.map(
                    (item) =>
                      item.id ===
                      streamingId
                        ? {
                            ...item,
                            content:
                              item.content +
                              chunk,
                          }
                        : item
                  )
              );
            }
          );


        const assistantMessage = {
          ...mapChatResponse(
            response
          ),
          evidence:
            mapSources(
              response.sources ?? []
            ),
        };


        setMessages(
          (previous) => {

            const withoutStreaming =
              previous.filter(
                (item) =>
                  item.id !==
                  streamingId
              );

            return [
              ...withoutStreaming,
              assistantMessage,
            ];
          }
        );


        setActiveEvidence(
          mapSources(
            response.sources ?? []
          )
        );


      } catch (error) {

        console.error(
          "Paper selection continuation failed:",
          error
        );

        setActiveEvidence([]);

        setMessages(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                streamingId
            )
        );

      } finally {

        setIsQuerying(false);

      }
    };


    // The research-context event is a real historical
    // message. It renders once at the exact position
    // where the selection happened.
    if (
      message.role ===
      "research_context"
    ) {

      return (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="w-full"
        >

          <div
            className={cn(
              "rounded-xl border px-4 py-3",
              "border-primary/20",
              "bg-primary/[0.045]"
            )}
          >

            <div className="flex items-center gap-2.5">

              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Check
                  className="h-3.5 w-3.5 text-primary"
                  strokeWidth={3}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] uppercase tracking-wider text-primary/70">
                  Research context
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-zinc-200">
                  {message.content}
                </p>

              </div>

            </div>

          </div>

        </motion.div>
      );
    }
    console.log("PAPER SELECTION DEBUG:", {
    messageId: message.id,
    paperSelection: message.paperSelection,
    selectedDocumentId,
  });
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex w-full",
          isUser
            ? "justify-end"
            : "justify-start"
        )}
      >

        <div
          className={cn(
            "min-w-0",
            isUser
              ? "flex max-w-[72%] flex-col items-end"
              : "w-full max-w-[88%]"
          )}
        >

          <div
            className={cn(
              "text-[14px] leading-6",
              isUser
                ? "rounded-2xl bg-[#2f2f2f] px-4 py-2.5 text-zinc-100"
                : "text-zinc-300"
            )}
          >

            {message.isStreaming &&
            !message.content ? (
              <StreamingIndicator />
            ) : isUser ? (
              <p className="whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <>
                <MarkdownRenderer
                  content={
                    message.content
                  }
                />

                {message.isStreaming && (
                  <span
                    aria-hidden="true"
                    className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 rounded-full bg-primary/70 align-middle animate-pulse"
                  />
                )}
              </>
            )}

          </div>


          {!isUser && (
            <div className="mt-2">

              <AnimatePresence mode="wait">

                {message.paperSelection &&
                message.paperSelection.required &&
                message.paperSelection.documents.length > 0 &&
                selectedDocumentId === null ? (

                    <motion.div
                      key="paper-options"
                      initial={{
                        opacity: 0,
                        y: 4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >

                      <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                        Select a paper
                      </p>

                      <div className="mt-2 space-y-1.5">

                        {message.paperSelection.documents.map(
                          (document) => {

                            const isSelected =
                              selectedDocumentId ===
                              document.id;

                            return (
                              <button
                                key={
                                  document.id
                                }
                                type="button"
                                onClick={() =>
                                  handlePaperSelect(
                                    document.id
                                  )
                                }
                                disabled={
                                  isQuerying
                                }
                                className={cn(
                                  "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                                  isSelected
                                    ? "border-primary/30 bg-primary/[0.06]"
                                    : "border-white/[0.06] bg-surface/40 hover:border-primary/20 hover:bg-primary/[0.03]",
                                  isQuerying &&
                                    "cursor-not-allowed opacity-60"
                                )}
                              >

                                <span
                                  className={cn(
                                    "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border bg-white transition-all",
                                    isSelected
                                      ? "border-primary"
                                      : "border-zinc-400"
                                  )}
                                >

                                  {isSelected && (
                                    <Check
                                      className="h-3 w-3 text-primary"
                                      strokeWidth={3}
                                    />
                                  )}

                                </span>

                                <BookOpen
                                  className={cn(
                                    "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                                    isSelected
                                      ? "text-primary"
                                      : "text-zinc-600 group-hover:text-primary/70"
                                  )}
                                />

                                <span
                                  className={cn(
                                    "min-w-0 truncate text-sm transition-colors",
                                    isSelected
                                      ? "text-zinc-200"
                                      : "text-zinc-400 group-hover:text-zinc-300"
                                  )}
                                >
                                  {
                                    document.title
                                  }
                                </span>

                              </button>
                            );
                          }
                        )}

                      </div>

                    </motion.div>

                  ) : null}

                </AnimatePresence>

              </div>
            )}


          {!isUser &&
            message.evidence &&
            message.evidence.length >
              0 && (

              <button
                onClick={
                  onEvidenceClick
                }
                className="mt-1 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-primary transition-colors"
                aria-label={`View ${message.evidence.length} sources`}
              >

                <Database className="h-3 w-3" />

                {
                  message.evidence
                    .length
                }{" "}
                source
                {message.evidence
                  .length !== 1
                  ? "s"
                  : ""}

              </button>
            )}

        </div>

      </motion.div>
    );
  }
);
