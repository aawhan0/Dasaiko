import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Sparkles,
  Database,
  Check,
  BookOpen,
} from "lucide-react";

import { fadeInUp } from "@/utils/animations";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { StreamingIndicator } from "./StreamingIndicator";
import { formatRelativeDate } from "@/utils/formatters";
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
          await sendQuery({

            conversation_id:
              conversationId,

            query:
              originalQuestion.content,

            selected_document_id:
              documentId,

            selection_continuation:
              true,
          });


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
    // message. It must render once where it occurred,
    // rather than being derived from the current
    // conversation-level selectedDocumentId.
    if (
      message.role ===
      "research_context"
    ) {

      return (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex gap-4"
        >

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border bg-primary/10 border-primary/20"
          >
            <Check
              className="w-4 h-4 text-primary"
              strokeWidth={3}
            />
          </div>

          <div className="flex-1 min-w-0 max-w-[85%]">

            <div
              className={cn(
                "rounded-xl border px-3 py-3",
                "border-primary/20",
                "bg-primary/[0.045]"
              )}
            >

              <div className="flex items-start gap-2.5">

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] uppercase tracking-wider text-primary/70">
                    Research context set
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-zinc-200">
                    {message.content}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                    I'll use this paper as
                    context when your
                    questions don't specify
                    another source.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-3 mt-1.5 px-1">

              <span className="text-[10px] text-zinc-700 font-mono">
                {formatRelativeDate(
                  message.timestamp
                )}
              </span>

            </div>

          </div>

        </motion.div>
      );
    }


    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex gap-4",
          isUser
            ? "flex-row-reverse"
            : "flex-row"
        )}
      >

        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border",
            isUser
              ? "bg-zinc-800 border-white/[0.08]"
              : "bg-primary/10 border-primary/20"
          )}
        >

          {isUser ? (
            <User className="w-4 h-4 text-zinc-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}

        </div>


        <div
          className={cn(
            "flex-1 min-w-0 max-w-[85%]",
            isUser &&
              "flex flex-col items-end"
          )}
        >

          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-[14px]",
              isUser
                ? "bg-surface border border-white/[0.08] text-zinc-300 rounded-tr-sm"
                : "text-zinc-300 rounded-tl-sm"
            )}
          >

            {message.isStreaming ? (
              <StreamingIndicator />
            ) : isUser ? (
              <p>
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer
                content={
                  message.content
                }
              />
            )}

          </div>


          {!isUser && (
            <div className="mt-3">

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

                      <p className="px-1 text-[10px] uppercase tracking-wider text-zinc-600">
                        Select a paper
                      </p>

                      <div className="mt-1.5 space-y-1.5">

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
                                  "group flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all",
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
                                    "min-w-0 truncate text-xs transition-colors",
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


          <div
            className={cn(
              "flex items-center gap-3 mt-1.5 px-1",
              isUser
                ? "flex-row-reverse"
                : "flex-row"
            )}
          >

            <span className="text-[10px] text-zinc-700 font-mono">
              {formatRelativeDate(
                message.timestamp
              )}
            </span>


            {!isUser &&
              message.evidence &&
              message.evidence.length >
                0 && (

                <button
                  onClick={
                    onEvidenceClick
                  }
                  className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-primary transition-colors"
                  aria-label={`View ${message.evidence.length} sources`}
                >

                  <Database className="w-3 h-3" />

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

        </div>

      </motion.div>
    );
  }
);
