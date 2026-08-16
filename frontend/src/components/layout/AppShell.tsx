import React from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Plus,
  ChevronRight,
} from "lucide-react";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

import {
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

import {
  createConversation,
} from "@/services/conversations";


interface AppShellProps {
  children: React.ReactNode;
}


export function AppShell({
  children,
}: AppShellProps) {

  const {
    conversations,
    messages,

    sidebarOpen,

    openSidebar,
    closeSidebar,

    addConversation,
    setActiveConversation,
    setMessages,
  } = useWorkspaceStore();


  /*
   * -------------------------------------------------------
   * SIDEBAR / RESEARCH STATE
   * -------------------------------------------------------
   *
   * The sidebar is useful once the user has actually
   * started working in a conversation.
   *
   * A manually collapsed sidebar remains collapsed even
   * while the conversation itself is active.
   */

  const hasStartedResearch =
    conversations.length > 0 ||
    messages.length > 0;


  /*
   * -------------------------------------------------------
   * NEW WORKSPACE
   * -------------------------------------------------------
   *
   * This is intentionally the same operation as the
   * "New Workspace" button inside Sidebar.tsx.
   *
   * We also close the sidebar because the user is entering
   * a fresh workspace.
   */

  const handleNewWorkspace =
    async () => {

      try {

        const conversation =
          await createConversation();


        addConversation(
          conversation,
        );


        setActiveConversation(
          conversation.id,
        );


        setMessages(
          [],
        );


        /*
         * A newly-created workspace starts in the
         * clean central state.
         */

        closeSidebar();

      } catch (error) {

        console.error(
          "Failed to create workspace:",
          error,
        );

      }

    };


  /*
   * -------------------------------------------------------
   * FLOATING CONTROLS
   * -------------------------------------------------------
   *
   * These controls exist only when:
   *
   * 1. The user has started a conversation.
   * 2. The main sidebar is collapsed.
   *
   * They are positioned independently from the sidebar
   * so they never affect the conversation layout.
   */

  const showFloatingControls =
    hasStartedResearch &&
    !sidebarOpen;


  return (

    <div
      className="
        flex
        h-screen
        w-screen
        flex-col
        overflow-hidden
        bg-base
        text-zinc-300
      "
    >

      {/* ===================================================
          TOP NAV
      =================================================== */}

      <TopNav />


      {/* ===================================================
          APPLICATION BODY
      =================================================== */}

      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          overflow-hidden
        "
      >

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <AnimatePresence
          initial={false}
        >

          {hasStartedResearch &&
            sidebarOpen && (

              <motion.div
                key="workspace-sidebar"

                initial={{
                  width: 0,
                  opacity: 0,
                  x: -24,
                }}

                animate={{
                  width: 324,
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  width: 0,
                  opacity: 0,
                  x: -24,
                }}

                transition={{
                  duration: 0.30,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}

                className="
                  relative
                  h-full
                  shrink-0
                  overflow-hidden
                "
              >

                <div
                  className="
                    h-full
                    w-[324px]
                  "
                >

                  <Sidebar />

                </div>

              </motion.div>

            )}

        </AnimatePresence>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main
          className="
            relative
            flex
            min-w-0
            min-h-0
            flex-1
            overflow-hidden
          "
        >

          {children}


          {/* ===============================================
              COLLAPSED SIDEBAR FLOATING CONTROLS
          ================================================ */}

          <AnimatePresence>

            {showFloatingControls && (

              <motion.div
                key="collapsed-sidebar-controls"

                initial={{
                  opacity: 0,
                  x: -12,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -12,
                }}

                transition={{
                  duration: 0.22,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}

                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-5
                  z-50
                  flex
                  flex-col
                  items-center
                  gap-2
                "
              >

                {/* =========================================
                    NEW WORKSPACE
                ========================================== */}

                <motion.button
                  type="button"

                  onClick={
                    handleNewWorkspace
                  }

                  whileHover={{
                    scale: 1.06,
                  }}

                  whileTap={{
                    scale: 0.94,
                  }}

                  aria-label="New Workspace"
                  title="New Workspace"

                  className="
                    pointer-events-auto

                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-full

                    bg-white
                    text-black

                    shadow-[0_4px_18px_rgba(0,0,0,0.35)]

                    transition-shadow
                    duration-200

                    hover:shadow-[0_6px_24px_rgba(255,255,255,0.12)]

                    focus:outline-none
                    focus:ring-2
                    focus:ring-white/30
                    focus:ring-offset-2
                    focus:ring-offset-base
                  "
                >

                  <Plus
                    className="
                      h-[18px]
                      w-[18px]
                      stroke-[2.5]
                    "
                  />

                </motion.button>


                {/* =========================================
                    REOPEN SIDEBAR
                ========================================== */}

                <motion.button
                  type="button"

                  onClick={
                    openSidebar
                  }

                  whileHover={{
                    scale: 1.06,
                  }}

                  whileTap={{
                    scale: 0.94,
                  }}

                  aria-label="Open sidebar"
                  title="Open sidebar"

                  className="
                    pointer-events-auto

                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-white/[0.12]

                    bg-[#0b0b0b]/90
                    text-zinc-400

                    shadow-[0_4px_18px_rgba(0,0,0,0.30)]

                    backdrop-blur-md

                    transition-all
                    duration-200

                    hover:border-white/[0.22]
                    hover:bg-white/[0.07]
                    hover:text-white

                    focus:outline-none
                    focus:ring-2
                    focus:ring-white/20
                    focus:ring-offset-2
                    focus:ring-offset-base
                  "
                >

                  <ChevronRight
                    className="
                      h-[18px]
                      w-[18px]
                      stroke-[2]
                    "
                  />

                </motion.button>

              </motion.div>

            )}

          </AnimatePresence>

        </main>

      </div>

    </div>
  );
}