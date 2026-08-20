import {
  useRef,
  useEffect,
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
  FileText,
} from "lucide-react";

import {
  useUpload,
} from "@/hooks/useUpload";

import {
  cn,
} from "@/utils/cn";

import {
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

import {
  sendQuery,
} from "@/services/chat";

import {
  createConversation,
} from "@/services/conversations";

import {
  mapChatResponse,
  mapSources,
} from "@/mappers/chatMapper";


interface MessageInputProps {
  centered?: boolean;
  hasDocuments?: boolean;
}


export function MessageInput({
  centered = false,
  hasDocuments = false,
}: MessageInputProps) {

  const [
    value,
    setValue,
  ] = useState("");


  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  /* =====================================================
     UPLOAD
  ====================================================== */

  const {
    onFileInputChange,
    queue,
  } = useUpload();


  /* =====================================================
     WORKSPACE
  ====================================================== */

  const {
    messages,

    isQuerying,
    setIsQuerying,

    addMessage,
    setMessages,

    setActiveEvidence,

    activeConversationId,

    addConversation,
    setActiveConversation,

    selectedDocumentId,

    documents,

    setSelectedDocumentId,

    /*
     * IMPORTANT:
     *
     * New Workspace closes the sidebar.
     *
     * The sidebar must reopen when the
     * first valid query is submitted.
     */
    openSidebar,

  } = useWorkspaceStore();


  /* =====================================================
     CONVERSATION STATE
  ====================================================== */

  /*
   * The document requirement only applies while
   * creating the FIRST message of a conversation.
   *
   * Once messages exist, the user can continue
   * asking questions normally.
   */

  const isFirstMessage =
    messages.length === 0;


  /* =====================================================
     DOCUMENT STATE
  ====================================================== */

  const readyDocuments =
    documents.filter(
      (document) =>
        document.status === "ready",
    );


  const selectedDocument =
    selectedDocumentId !== null
      ? documents.find(
          (document) =>
            Number(document.id) ===
            selectedDocumentId,
        )
      : undefined;


  /*
   * A ready document anywhere in the workspace
   * is enough to unlock the first query.
   */

  const hasReadyDocument =
    readyDocuments.length > 0;


  /*
   * If the workspace already knows about documents,
   * preserve that signal as well.
   */

  const workspaceHasDocument =
    hasDocuments ||
    documents.length > 0;


  /*
   * Keep this calculation intentionally explicit.
   *
   * It is useful for the UI state even though
   * the actual send rule is based on documentReady.
   */

  void workspaceHasDocument;


  /* =====================================================
     UPLOAD STATE
  ====================================================== */

  const latestUpload =
    queue.length > 0
      ? queue[queue.length - 1]
      : null;


  const isUploading =
    latestUpload?.status ===
    "uploading";


  const isProcessing =
    latestUpload?.status ===
    "processing";


  const isReady =
    latestUpload?.status ===
    "ready";


  const uploadFailed =
    latestUpload?.status ===
    "error";


  /*
   * A document is considered ready when:
   *
   * 1. A selected document is ready
   * OR
   * 2. Any ready document exists.
   */

  const documentReady =
    Boolean(
      selectedDocument?.status ===
        "ready",
    ) ||
    hasReadyDocument;


  /* =====================================================
     INPUT / SEND RULES
  ====================================================== */

  /*
   * User is allowed to TYPE regardless of whether
   * a document exists.
   *
   * The only thing that blocks typing is an active
   * request being generated.
   */

  const canType =
    !isQuerying;


  /*
   * Queries may be submitted without a selected
   * document. The backend decides whether paper
   * selection is required and can return the
   * paper picker response.
   */

  const canSend =
    !isQuerying;


  /*
   * Paperclip attention cue.
   *
   * Only show it when the user has not yet
   * uploaded a document and isn't currently
   * uploading one.
   */

  const showPaperclipCue =
    !documentReady &&
    !isUploading &&
    !isProcessing &&
    !isQuerying;


  /* =====================================================
     STREAMING STATE
  ====================================================== */

  const streamQueueRef =
    useRef("");


  const streamTimerRef =
    useRef<number | null>(
      null,
    );


  const streamDoneRef =
    useRef(false);


  const streamMessageIdRef =
    useRef<string | null>(
      null,
    );


  const streamFinalResponseRef =
    useRef<
      Awaited<
        ReturnType<
          typeof sendQuery
        >
      > | null
    >(null);


  const streamErrorRef =
    useRef<unknown>(
      null,
    );


  /* =====================================================
     CLEAR STREAM TIMER
  ====================================================== */

  const clearStreamTimer =
    () => {

      if (
        streamTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          streamTimerRef.current,
        );

        streamTimerRef.current =
          null;
      }

    };


  /* =====================================================
     FINISH STREAM
  ====================================================== */

  const finishStream =
    (
      messageId: string,
    ) => {

      try {

        const finalResponse =
          streamFinalResponseRef.current;


        /*
         * Successful response
         */

        if (
          finalResponse
        ) {

          const mappedResponse =
            mapChatResponse(
              finalResponse,
            );


          const mappedEvidence =
            mapSources(
              finalResponse.sources ??
                [],
            );


          setMessages(
            (previous) =>
              previous.map(
                (message) =>
                  message.id ===
                  messageId
                    ? {
                        ...mappedResponse,

                        evidence:
                          mappedEvidence,

                        /*
                         * Preserve the streamed
                         * content because it has
                         * already been rendered.
                         */

                        content:
                          message.content,

                        isStreaming:
                          false,
                      }
                    : message,
              ),
          );


          setActiveEvidence(
            mappedEvidence,
          );


          return;
        }


        /*
         * Request failed
         */

        if (
          streamErrorRef.current
        ) {

          console.error(
            "Chat Error:",
            streamErrorRef.current,
          );


          setActiveEvidence(
            [],
          );


          setMessages(
            (previous) =>
              previous.filter(
                (message) =>
                  message.id !==
                  messageId,
              ),
          );

        }

      } catch (error) {

        /*
         * Even if response mapping or
         * evidence mapping fails, the
         * composer MUST unlock.
         */

        console.error(
          "Failed to finalize chat response:",
          error,
        );

      } finally {

        streamMessageIdRef.current =
          null;


        streamFinalResponseRef.current =
          null;


        streamErrorRef.current =
          null;


        streamDoneRef.current =
          false;


        streamQueueRef.current =
          "";


        clearStreamTimer();


        /*
         * Critical unlock.
         */

        setIsQuerying(
          false,
        );

      }

    };


  /* =====================================================
     STREAM RENDERER
  ====================================================== */

  const startStreamRenderer =
    (
      messageId: string,
    ) => {

      /*
       * Don't start duplicate render loops.
       */

      if (
        streamTimerRef.current !==
        null
      ) {

        return;
      }


      const renderNext =
        () => {

          const queue =
            streamQueueRef.current;


          /*
           * There is still streamed text
           * waiting to be displayed.
           */

          if (
            queue.length > 0
          ) {

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
              (previous) =>
                previous.map(
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


          /*
           * Queue is empty.
           *
           * If the backend has finished,
           * finalize immediately.
           */

          if (
            streamDoneRef.current
          ) {

            finishStream(
              messageId,
            );

            return;
          }


          /*
           * Backend is still running.
           */

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


      renderNext();

    };


  /* =====================================================
     SUBMIT
  ====================================================== */

  const handleSubmit =
    async () => {

      const question =
        value.trim();


      /*
       * Empty question.
       */

      if (
        !question
      ) {

        return;
      }


      /*
       * Prevent double submission
       * while a request is running.
       */

      if (
        isQuerying
      ) {

        return;
      }


      /*
       * A query may be submitted without a
       * selected document.
       *
       * The backend decides whether paper
       * selection is required and returns the
       * paper picker when necessary.
       */

      /* =================================================
         DETERMINE DOCUMENT
      ================================================== */

      const queryDocumentId =
        selectedDocumentId;


      /* =================================================
         OPEN SIDEBAR
      ================================================== */

      /*
       * IMPORTANT UX RULE:
       *
       * The sidebar stays hidden while the user
       * is sitting in a fresh workspace.
       *
       * It reappears ONLY when the user actually
       * submits the first valid query.
       *
       * Typing does not trigger this.
       */

      if (
        isFirstMessage
      ) {

        openSidebar();

      }


      /* =================================================
         CREATE CONVERSATION
      ================================================== */

      let conversationId =
        activeConversationId;


      if (
        !conversationId
      ) {

        try {

          const conversation =
            await createConversation();


          addConversation(
            conversation,
          );


          setActiveConversation(
            conversation.id,
          );


          conversationId =
            conversation.id;

        } catch (error) {

          console.error(
            "Failed to create conversation:",
            error,
          );


          return;
        }

      }


      const numericConversationId =
        Number(
          conversationId,
        );


      if (
        Number.isNaN(
          numericConversationId,
        )
      ) {

        console.error(
          "Invalid conversation id:",
          conversationId,
        );


        return;
      }


      /* =================================================
         CLEAR INPUT
      ================================================== */

      setValue(
        "",
      );


      if (
        textareaRef.current
      ) {

        textareaRef.current.style.height =
          "44px";

      }


      /* =================================================
         USER MESSAGE
      ================================================== */

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
        userMessage,
      );


      /* =================================================
         STREAMING PLACEHOLDER
      ================================================== */

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


      streamQueueRef.current =
        "";


      streamDoneRef.current =
        false;


      streamMessageIdRef.current =
        streamingMessage.id;


      streamFinalResponseRef.current =
        null;


      streamErrorRef.current =
        null;


      addMessage(
        streamingMessage,
      );


      setIsQuerying(
        true,
      );


      /*
       * Start renderer BEFORE the request.
       *
       * It will wait for chunks.
       */

      startStreamRenderer(
        streamingMessage.id,
      );


      /* =================================================
         API
      ================================================== */

      try {

        const response =
          await sendQuery(
            {
              conversation_id:
                numericConversationId,

              query:
                question,

              selected_document_id:
                queryDocumentId,
            },

            (
              chunk,
            ) => {

              streamQueueRef.current +=
                chunk;

            },
          );


        streamFinalResponseRef.current =
          response;


        streamDoneRef.current =
          true;


        /*
         * If the renderer isn't currently
         * running, restart it.
         *
         * This also handles the case where
         * the response arrives with no streamed
         * chunks.
         */

        if (
          streamTimerRef.current ===
          null
        ) {

          startStreamRenderer(
            streamingMessage.id,
          );

        }

      } catch (error) {

        console.error(
          "Chat Error:",
          error,
        );


        streamErrorRef.current =
          error;


        streamDoneRef.current =
          true;


        /*
         * If the renderer is somehow not
         * running, make sure the request
         * still gets finalized.
         */

        if (
          streamTimerRef.current ===
          null
        ) {

          finishStream(
            streamingMessage.id,
          );

        }

      }

    };


  /* =====================================================
     KEYBOARD
  ====================================================== */

  const handleKeyDown = (
    event:
      React.KeyboardEvent<
        HTMLTextAreaElement
      >,
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSubmit();

    }

  };


  /* =====================================================
     TEXT INPUT
  ====================================================== */

  const handleInput = (
    event:
      React.ChangeEvent<
        HTMLTextAreaElement
      >,
  ) => {

    /*
     * Typing is allowed even without
     * a document.
     */

    if (
      !canType
    ) {

      return;
    }


    setValue(
      event.target.value,
    );


    const textarea =
      textareaRef.current;


    if (
      !textarea
    ) {

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


  /* =====================================================
     CLEANUP
  ====================================================== */

  useEffect(() => {

    return () => {

      clearStreamTimer();

    };

  }, []);


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.55,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        },
      }}
      className={cn(
        "w-full",
        centered
          ? "max-w-2xl"
          : "max-w-4xl",
      )}
    >

      {/* =================================================
          COMPOSER
      ================================================== */}

      <motion.div
        animate={{
          boxShadow:
            documentReady &&
            !isQuerying
              ? [
                  "0 0 0 1px rgba(99,102,241,0.04), 0 0 0 rgba(99,102,241,0)",
                  "0 0 0 1px rgba(99,102,241,0.12), 0 0 28px rgba(99,102,241,0.08)",
                  "0 0 0 1px rgba(99,102,241,0.04), 0 0 0 rgba(99,102,241,0)",
                ]
              : "0 0 0 0 rgba(0,0,0,0)",
        }}
        transition={{
          duration: 2.8,
          repeat:
            documentReady &&
            !isQuerying
              ? Infinity
              : 0,
          ease: "easeInOut",
        }}
        className={cn(
          `
            group
            flex
            min-h-[56px]
            items-end
            gap-1.5
            rounded-2xl
            border
            bg-[#0A0A0A]
            p-1.5
            transition-all
            duration-300
          `,

          documentReady
            ? `
              border-primary/20
              focus-within:border-primary/35
            `
            : `
              border-white/[0.09]
            `,
        )}
      >

        {/* =================================================
            PAPERCLIP
        ================================================== */}

        <motion.button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={
            isQuerying ||
            isUploading ||
            isProcessing
          }
          aria-label="Upload research document"
          title="Upload research document"
          animate={
            showPaperclipCue
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(99,102,241,0)",
                    "0 0 0 5px rgba(99,102,241,0.06), 0 0 18px rgba(99,102,241,0.16)",
                    "0 0 0 0 rgba(99,102,241,0)",
                  ],
                }
              : {
                  boxShadow:
                    "0 0 0 0 rgba(99,102,241,0)",
                }
          }
          transition={{
            duration: 2.4,
            repeat:
              showPaperclipCue
                ? Infinity
                : 0,
            ease: "easeInOut",
          }}
          className={cn(
            `
              relative
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

            showPaperclipCue
              ? `
                border-primary/10
                bg-primary/[0.025]
                text-zinc-400
              `
              : `
                border-transparent
                text-zinc-600
              `,

            "hover:border-white/[0.08]",
            "hover:bg-white/[0.04]",
            "hover:text-zinc-300",

            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          )}
        >

          <Paperclip
            className="
              h-[17px]
              w-[17px]
            "
          />

        </motion.button>


        {/* =================================================
            INPUT
        ================================================== */}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={
            handleInput
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            canType
              ? "Ask anything about your research…"
              : isUploading
                ? "Uploading your research…"
                : isProcessing
                  ? "Preparing your research…"
                  : uploadFailed
                    ? "Upload failed — try again…"
                    : "Ask anything about your research…"
          }
          rows={1}
          disabled={
            !canType
          }
          className={cn(
            `
              min-h-[44px]
              max-h-[160px]
              flex-1
              resize-none
              overflow-y-auto
              bg-transparent
              px-1
              py-2.5
              text-[14px]
              font-medium
              leading-6
              text-zinc-200
              placeholder:text-zinc-600
              focus:outline-none
            `,

            !canType &&
              `
                cursor-default
                select-none
              `,
          )}
        />


        {/* =================================================
            SEND
        ================================================== */}

        <motion.button
          type="button"
          whileHover={{
            scale:
              value.trim() &&
              canSend
                ? 1.03
                : 1,
          }}
          whileTap={{
            scale:
              value.trim() &&
              canSend
                ? 0.96
                : 1,
          }}
          onClick={
            handleSubmit
          }
          disabled={
            !value.trim() ||
            !canSend
          }
          aria-label="Send research query"
          title="Send research query"
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
              canSend
              ? `
                border-primary/30
                bg-primary
                text-white
                shadow-[0_0_18px_rgba(99,102,241,0.16)]
                hover:bg-primary/90
              `
              : `
                border-white/[0.05]
                bg-white/[0.025]
                text-zinc-700
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
            FILE INPUT
        ================================================== */}

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          multiple
          className="hidden"
          onChange={(
            event,
          ) => {

            onFileInputChange(
              event,
            );

            event.target.value =
              "";

          }}
        />

      </motion.div>


      {/* =================================================
          DOCUMENT STATUS
      ================================================== */}

      {latestUpload &&
        (
          isUploading ||
          isProcessing ||
          isReady ||
          uploadFailed
        ) && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              flex
              items-center
              justify-center
              gap-2
              overflow-hidden
              pt-2
            "
          >

            {isUploading ||
            isProcessing ? (

              <Loader2
                className="
                  h-3
                  w-3
                  animate-spin
                  text-primary/70
                "
              />

            ) : isReady ? (

              <Check
                className="
                  h-3
                  w-3
                  text-primary/80
                "
              />

            ) : (

              <FileText
                className="
                  h-3
                  w-3
                  text-red-400/70
                "
              />

            )}


            <span
              className="
                max-w-[280px]
                truncate
                text-[9px]
                font-medium
                text-zinc-600
              "
            >

              {isUploading
                ? `Uploading ${latestUpload.file.name}`
                : isProcessing
                  ? `Preparing ${latestUpload.file.name}`
                  : isReady
                    ? `${latestUpload.file.name} ready`
                    : "Upload failed"}

            </span>

          </motion.div>

        )}

    </motion.div>
  );
}