import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { KnowledgeLibrary } from "@/components/library/KnowledgeLibrary";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ConversationItem } from "@/components/conversation/ConversationItem";
import { ConversationMenu } from "@/components/conversation/ConversationMenu";
import { DasaikoLogo } from "@/components/brand/DasaikoLogo";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import {
  createConversation,
  toggleConversationPin,
  renameConversation,
  deleteConversation,
} from "@/services/conversations";

import { listMessages } from "@/services/messages";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    conversations,
    activeConversationId,

    setActiveConversation,

    addConversation,
    updateConversation,
    removeConversation,
    setMessages,

    sidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<
    "library" | "threads"
  >("threads");

  const [
    editingConversationId,
    setEditingConversationId,
  ] = useState<string | null>(null);

  const [
    editingTitle,
    setEditingTitle,
  ] = useState("");

  const [contextMenu, setContextMenu] =
    useState<{
      x: number;
      y: number;
      conversationId: string;
    } | null>(null);

  const pinnedConversations =
    conversations.filter(
      (conversation) =>
        conversation.isPinned,
    );

  const otherConversations =
    conversations.filter(
      (conversation) =>
        !conversation.isPinned,
    );

  /* =========================================================
     CREATE NEW WORKSPACE
  ========================================================= */

  const handleNewWorkspace =
    async () => {
      try {
        const conversation =
          await createConversation();

        addConversation(conversation);

        setActiveConversation(
          conversation.id,
        );

        setMessages([]);

        setActiveTab("threads");
      } catch (err) {
        console.error(
          "Failed to create workspace",
          err,
        );
      }
    };

  /* =========================================================
     OPEN CONVERSATION
  ========================================================= */

  const handleOpenConversation =
    async (
      conversationId: string,
    ) => {
      setActiveConversation(
        conversationId,
      );

      const messages =
        await listMessages(
          conversationId,
        );

      setMessages(messages);
    };

  /* =========================================================
     PIN / UNPIN
  ========================================================= */

  const handleTogglePin =
    async (
      conversationId: string,
    ) => {
      try {
        const updated =
          await toggleConversationPin(
            conversationId,
          );

        updateConversation(updated);
      } catch (err) {
        console.error(
          "Failed to toggle pin",
          err,
        );
      }
    };

  /* =========================================================
     RENAME
  ========================================================= */

  const startRename = (
    conversationId: string,
  ) => {
    const conversation =
      conversations.find(
        (conversation) =>
          conversation.id ===
          conversationId,
      );

    if (!conversation) {
      return;
    }

    setEditingConversationId(
      conversation.id,
    );

    setEditingTitle(
      conversation.title,
    );
  };

  const cancelRename = () => {
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const handleRename =
    async () => {
      if (!editingConversationId) {
        return;
      }

      // Preserve whitespace while
      // editing. Trim only when saving.
      const finalTitle =
        editingTitle.trim();

      if (!finalTitle) {
        cancelRename();
        return;
      }

      try {
        const updated =
          await renameConversation(
            editingConversationId,
            finalTitle,
          );

        updateConversation(updated);

        cancelRename();
      } catch (err) {
        console.error(
          "Rename failed",
          err,
        );
      }
    };

  /* =========================================================
     F2 RENAME SHORTCUT
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "F2") {
        return;
      }

      if (!activeConversationId) {
        return;
      }

      event.preventDefault();

      startRename(
        activeConversationId,
      );
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [
    activeConversationId,
    conversations,
  ]);

  /* =========================================================
     CONTEXT MENU CLEANUP
  ========================================================= */

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };

    window.addEventListener(
      "click",
      handleClick,
    );

    return () =>
      window.removeEventListener(
        "click",
        handleClick,
      );
  }, []);

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{
            width: 0,
            opacity: 0,
          }}
          animate={{
            width: 292,
            opacity: 1,
          }}
          exit={{
            width: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
          className="
            flex
            h-full
            shrink-0
            flex-col
            overflow-hidden
            border-r-[1.5px]
            border-white/[0.10]
            bg-[#070707]
          "
        >
          {/* =================================================
              BRAND HEADER
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b-[1.5px]
              border-white/[0.09]
              px-4
              py-4
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="
                group
                flex
                items-center
                rounded-xl
                py-1
                transition-opacity
                duration-200
                hover:opacity-90
              "
              aria-label="Go to Dasaiko home"
            >
              <DasaikoLogo
                size="md"
                variant="gradient"
              />
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border-[1.5px]
                border-white/[0.08]
                bg-white/[0.025]
                text-zinc-500
                transition-all
                duration-200
                hover:border-white/[0.18]
                hover:bg-white/[0.07]
                hover:text-white
              "
            >
              <ChevronLeft
                className="
                  h-4
                  w-4
                  stroke-[2.2]
                "
              />
            </button>
          </div>

          {/* =================================================
              NEW WORKSPACE
          ================================================== */}

          <div
            className="
              shrink-0
              px-3
              pb-3
              pt-4
            "
          >
            <motion.button
              type="button"
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.985,
              }}
              onClick={
                handleNewWorkspace
              }
              className="
                group
                flex
                w-full
                items-center
                gap-2.5
                rounded-xl
                border-[1.5px]
                border-primary/30
                bg-primary/[0.10]
                px-3.5
                py-3
                text-left
                text-[13px]
                font-bold
                text-primary-200
                transition-all
                duration-200
                hover:border-primary/50
                hover:bg-primary/[0.16]
                hover:shadow-[0_0_28px_rgba(99,102,241,0.10)]
              "
            >
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-primary/25
                  bg-primary/[0.12]
                "
              >
                <Plus
                  className="
                    h-4
                    w-4
                    stroke-[2.6]
                    text-primary
                  "
                />
              </span>

              <span className="flex-1">
                New Workspace
              </span>

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-primary/50
                  transition-colors
                  group-hover:text-primary/80
                "
              >
                New
              </span>
            </motion.button>
          </div>

          {/* =================================================
              TABS
          ================================================== */}

          <div
            className="
              shrink-0
              px-3
              pb-3
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-1
                rounded-xl
                border-[1.5px]
                border-white/[0.07]
                bg-white/[0.018]
                p-1
              "
            >
              {(
                [
                  "threads",
                  "library",
                ] as const
              ).map((tab) => {
                const isActive =
                  activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab)
                    }
                    className={cn(
                      `
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2.5
                        text-[11px]
                        font-bold
                        capitalize
                        transition-all
                        duration-200
                      `,
                      isActive
                        ? `
                          border-[1.5px]
                          border-white/[0.12]
                          bg-white/[0.075]
                          text-white
                          shadow-[0_4px_15px_rgba(0,0,0,0.18)]
                        `
                        : `
                          border-[1.5px]
                          border-transparent
                          text-zinc-500
                          hover:border-white/[0.07]
                          hover:bg-white/[0.035]
                          hover:text-zinc-200
                        `,
                    )}
                  >
                    {tab === "library" ? (
                      <LayoutDashboard
                        className="
                          h-3.5
                          w-3.5
                          stroke-[2.2]
                        "
                      />
                    ) : (
                      <MessageSquare
                        className="
                          h-3.5
                          w-3.5
                          stroke-[2.2]
                        "
                      />
                    )}

                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-hidden
            "
          >
            {activeTab === "library" ? (
              <div
                className="
                  h-full
                  overflow-hidden
                  py-2
                "
              >
                <KnowledgeLibrary />
              </div>
            ) : (
              <div
                className="
                  h-full
                  overflow-y-auto
                  px-2
                  py-2
                "
              >
                {/* =========================================
                    PINNED
                ========================================== */}

                {pinnedConversations.length >
                  0 && (
                  <>
                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        px-3
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-primary
                          shadow-[0_0_10px_rgba(99,102,241,0.7)]
                        "
                      />

                      <p
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          text-zinc-400
                        "
                      >
                        Pinned
                      </p>
                    </div>

                    <div className="space-y-1">
                      {pinnedConversations.map(
                        (conversation) => (
                          <ConversationItem
                            key={
                              conversation.id
                            }
                            conversation={
                              conversation
                            }
                            isActive={
                              activeConversationId ===
                              conversation.id
                            }
                            isEditing={
                              editingConversationId ===
                              conversation.id
                            }
                            editingTitle={
                              editingTitle
                            }
                            onEditingTitleChange={
                              setEditingTitle
                            }
                            onRename={
                              handleRename
                            }
                            onCancelRename={
                              cancelRename
                            }
                            onOpen={() =>
                              handleOpenConversation(
                                conversation.id,
                              )
                            }
                            onTogglePin={() =>
                              handleTogglePin(
                                conversation.id,
                              )
                            }
                            onContextMenu={(
                              x,
                              y,
                            ) =>
                              setContextMenu({
                                x,
                                y,
                                conversationId:
                                  conversation.id,
                              })
                            }
                          />
                        ),
                      )}
                    </div>

                    <div
                      className="
                        my-4
                        h-px
                        bg-white/[0.07]
                      "
                    />
                  </>
                )}

                {/* =========================================
                    ALL CHATS
                ========================================== */}

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                    px-3
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-zinc-400
                    "
                  >
                    All Chats
                  </p>

                  <span
                    className="
                      text-[9px]
                      font-mono
                      font-semibold
                      text-zinc-600
                    "
                  >
                    {otherConversations.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {otherConversations.map(
                    (conversation) => (
                      <ConversationItem
                        key={
                          conversation.id
                        }
                        conversation={
                          conversation
                        }
                        isActive={
                          activeConversationId ===
                          conversation.id
                        }
                        isEditing={
                          editingConversationId ===
                          conversation.id
                        }
                        editingTitle={
                          editingTitle
                        }
                        onEditingTitleChange={
                          setEditingTitle
                        }
                        onRename={
                          handleRename
                        }
                        onCancelRename={
                          cancelRename
                        }
                        onOpen={() =>
                          handleOpenConversation(
                            conversation.id,
                          )
                        }
                        onTogglePin={() =>
                          handleTogglePin(
                            conversation.id,
                          )
                        }
                        onContextMenu={(
                          x,
                          y,
                        ) =>
                          setContextMenu({
                            x,
                            y,
                            conversationId:
                              conversation.id,
                          })
                        }
                      />
                    ),
                  )}
                </div>

                {/* Empty state */}

                {conversations.length ===
                  0 && (
                  <div
                    className="
                      mx-2
                      mt-8
                      rounded-xl
                      border-[1.5px]
                      border-dashed
                      border-white/[0.08]
                      px-4
                      py-7
                      text-center
                    "
                  >
                    <MessageSquare
                      className="
                        mx-auto
                        h-5
                        w-5
                        text-zinc-700
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-[11px]
                        font-bold
                        text-zinc-400
                      "
                    >
                      No research yet
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        font-medium
                        leading-5
                        text-zinc-600
                      "
                    >
                      Start a workspace to begin
                      researching.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              BOTTOM
          ================================================== */}

          <div
            className="
              shrink-0
              space-y-2
              border-t-[1.5px]
              border-white/[0.09]
              px-3
              py-3
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/settings")
              }
              className={cn(
                `
                  group
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-xl
                  border-[1.5px]
                  px-3
                  py-2.5
                  text-[12px]
                  font-bold
                  transition-all
                  duration-200
                `,
                location.pathname ===
                  "/settings"
                  ? `
                    border-white/[0.14]
                    bg-white/[0.07]
                    text-white
                  `
                  : `
                    border-transparent
                    text-zinc-500
                    hover:border-white/[0.09]
                    hover:bg-white/[0.04]
                    hover:text-white
                  `,
              )}
            >
              <Settings
                className="
                  h-4
                  w-4
                  stroke-[2.2]
                  transition-transform
                  duration-300
                  group-hover:rotate-45
                "
              />

              <span>
                Settings
              </span>
            </button>

            <div className="pt-1">
              <PrivacyBadge />
            </div>
          </div>
        </motion.aside>
      )}

      {/* =====================================================
          CONVERSATION CONTEXT MENU
      ====================================================== */}

      {contextMenu && (
        <ConversationMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPinned={
            conversations.find(
              (c) =>
                c.id ===
                contextMenu.conversationId,
            )?.isPinned ?? false
          }
          onRename={() => {
            startRename(
              contextMenu.conversationId,
            );

            setContextMenu(null);
          }}
          onTogglePin={() => {
            handleTogglePin(
              contextMenu.conversationId,
            );

            setContextMenu(null);
          }}
          onDelete={async () => {
            if (!contextMenu) {
              return;
            }

            const conversationId =
              contextMenu.conversationId;

            try {
              await deleteConversation(
                conversationId,
              );

              removeConversation(
                conversationId,
              );

              if (
                activeConversationId ===
                conversationId
              ) {
                setActiveConversation(
                  null,
                );

                setMessages([]);
              }
            } catch (error) {
              console.error(
                "Error deleting conversation:",
                error,
              );
            }

            setContextMenu(null);
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   COLLAPSED SIDEBAR TOGGLE
========================================================= */

export function SidebarToggle() {
  const {
    sidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  if (sidebarOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Open sidebar"
      title="Open sidebar"
      className="
        absolute
        left-4
        top-1/2
        z-20
        flex
        h-10
        w-10
        -translate-y-1/2
        items-center
        justify-center
        rounded-xl
        border-[1.5px]
        border-white/[0.10]
        bg-[#0D0D0D]
        text-zinc-500
        shadow-[0_8px_25px_rgba(0,0,0,0.25)]
        transition-all
        duration-200
        hover:border-white/[0.22]
        hover:bg-white/[0.08]
        hover:text-white
      "
    >
      <ChevronRight
        className="
          h-4
          w-4
          stroke-[2.3]
        "
      />
    </button>
  );
}