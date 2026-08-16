import {
  useRef,
  useEffect,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

import {
  ChatBlock,
} from "./ChatBlock";

import {
  MessageInput,
} from "./MessageInput";

import {
  EmptyState,
} from "./EmptyState";

import {
  fadeIn,
} from "@/utils/animations";


export function ResearchWorkbench() {

  const {
    messages,
  } = useWorkspaceStore();


  const scrollRef =
    useRef<HTMLDivElement | null>(
      null,
    );


  const shouldAutoScroll =
    useRef(true);


  /*
   * =====================================================
   * CONVERSATION STATE
   *
   * IMPORTANT:
   *
   * Documents do NOT determine whether we are in
   * conversation mode.
   *
   * The first actual user message does.
   * =====================================================
   */

  const hasConversation =
    messages.length > 0;


  /* =====================================================
     SCROLL POSITION
  ====================================================== */

  const handleScroll = () => {

    const container =
      scrollRef.current;


    if (!container) {
      return;
    }


    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;


    shouldAutoScroll.current =
      distanceFromBottom < 100;
  };


  /* =====================================================
     SCROLL WHEN MESSAGE COUNT CHANGES
  ====================================================== */

  useEffect(() => {

    const container =
      scrollRef.current;


    if (
      !container ||
      !shouldAutoScroll.current
    ) {
      return;
    }


    requestAnimationFrame(() => {

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });

    });

  }, [
    messages.length,
  ]);


  /* =====================================================
     SCROLL DURING STREAMING
  ====================================================== */

  useEffect(() => {

    const container =
      scrollRef.current;


    if (
      !container ||
      !shouldAutoScroll.current
    ) {
      return;
    }


    requestAnimationFrame(() => {

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "auto",
      });

    });

  }, [
    messages[
      messages.length - 1
    ]?.content,
  ]);


  /*
   * =====================================================
   * FRESH WORKSPACE
   *
   * Only the absence of messages determines this.
   *
   * This means uploading a document does NOT instantly
   * destroy the beautiful initial workspace layout.
   * =====================================================
   */

  const showEmptyState =
    !hasConversation;


  return (

    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="
        relative
        flex
        min-h-0
        min-w-0
        flex-1
        flex-col
        overflow-hidden
        bg-base
      "
    >

      {/* =================================================
          INITIAL / PRE-CONVERSATION STATE
      ================================================== */}

      {showEmptyState ? (

        <EmptyState />

      ) : (

        <>

          {/* =================================================
              CONVERSATION
          ================================================== */}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
              min-h-0
              flex-1
              overflow-y-auto

              px-5
              py-7

              sm:px-7
              sm:py-8

              lg:px-8
              lg:py-9

              [scrollbar-width:thin]
              [scrollbar-color:rgba(255,255,255,0.08)_transparent]
            "
          >

            <div
              className="
                mx-auto
                w-full
                max-w-4xl
                space-y-8
              "
            >

              {messages.map(
                (message) => (

                  <ChatBlock
                    key={
                      message.id
                    }
                    message={
                      message
                    }
                  />

                ),
              )}

            </div>

          </div>


          {/* =================================================
              NORMAL CONVERSATION COMPOSER
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.28,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="
              relative
              z-10
              shrink-0
              bg-base

              px-5
              pb-5
              pt-3

              sm:px-7
              sm:pb-6

              lg:px-8
            "
          >

            {/* =================================================
                TOP SEPARATOR
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/[0.055]
                to-transparent
              "
            />


            <div
              className="
                flex
                w-full
                justify-center
              "
            >

              <MessageInput
                centered={false}
              />

            </div>

          </motion.div>

        </>

      )}

    </motion.section>

  );
}