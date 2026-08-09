import { memo, useState } from "react";
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


    const [
      justSelected,
      setJustSelected,
    ] = useState(false);


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

      setJustSelected(true);

      window.setTimeout(() => {
        setJustSelected(false);
      }, 2200);


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


    const selectedPaper =
      selectedDocumentId !== null
        ? documents.find(
            (document) =>
              Number(document.id) ===
              selectedDocumentId
          )
        : null;


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


          {!isUser &&
            (
              // The paper-selection response owns the picker while it is
              // present in memory. After a reload, paperSelection is not
              // reconstructed from the persisted chat messages, so we also
              // render the context card on the latest assistant message.
              (
                message.paperSelection &&
                message.paperSelection.required &&
                message.paperSelection.documents.length > 0
              ) ||
              (
                selectedDocumentId !== null &&
                message.id ===
                  [...messages]
                    .reverse()
                    .find(
                      (item) =>
                        item.role === "assistant"
                    )?.id
              )
            ) && (

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

                  ) : selectedDocumentId !== null ? (

                    <motion.div
                      key="context-set"
                      initial={{
                        opacity: 0,
                        y: 6,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-3",
                        "border-primary/20",
                        "bg-primary/[0.045]"
                      )}
                    >

                      <div className="flex items-start gap-2.5">

                        <motion.div
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                          }}
                          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
                        >
                          <Check
                            className="h-3 w-3 text-primary"
                            strokeWidth={3}
                          />
                        </motion.div>

                        <div className="min-w-0 flex-1">

                          <p className="text-[10px] uppercase tracking-wider text-primary/70">
                            Research context set
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium text-zinc-200">
                            {selectedPaper?.title ??
                              (
                                message.paperSelection?.documents ??
                                []
                              ).find(
                                (document) =>
                                  document.id ===
                                  selectedDocumentId
                              )?.title ??
                              "Selected research paper"}
                          </p>

                          <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                            I'll use this paper as
                            context when your
                            questions don't specify
                            another source.
                          </p>

                        </div>

                      </div>

                      <AnimatePresence>

                        {justSelected && (

                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="overflow-hidden"
                          >

                            <div className="mt-2.5 border-t border-primary/10 pt-2 text-[10px] text-primary/60">
                              Your original question is
                              being answered using this
                              paper.
                            </div>

                          </motion.div>
                        )}

                      </AnimatePresence>

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
