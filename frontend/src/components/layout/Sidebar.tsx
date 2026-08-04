import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import{ ConversationMenu } from "@/components/conversation/ConversationMenu";
import {
  LayoutDashboard,
  Settings,
  Plus,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { KnowledgeLibrary } from "@/components/library/KnowledgeLibrary";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ConversationItem } from "@/components/conversation/ConversationItem";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import {
  createConversation,
  toggleConversationPin,
  renameConversation,
  deleteConversation,
} from "@/services/conversations";

import { listMessages } from "@/services/messages";

import { slideInLeft } from "@/utils/animations";

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
  >("library");

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
        conversation.isPinned
    );

  const otherConversations =
    conversations.filter(
      (conversation) =>
        !conversation.isPinned
    );

  const handleNewWorkspace = async () => {
    try {
      const conversation =
        await createConversation();

      addConversation(conversation);

      setActiveConversation(
        conversation.id
      );

      setMessages([]);

      setActiveTab("threads");
    } catch (err) {
      console.error(
        "Failed to create workspace",
        err
      );
    }
  };

  const handleOpenConversation =
    async (conversationId: string) => {
      setActiveConversation(
        conversationId
      );

      const messages =
        await listMessages(
          conversationId
        );

      setMessages(messages);
    };

  const handleTogglePin = async (
    conversationId: string
  ) => {
    try {
      const updated =
        await toggleConversationPin(
          conversationId
        );

      updateConversation(updated);
    } catch (err) {
      console.error(
        "Failed to toggle pin",
        err
      );
    }
  };

  const startRename = (
    conversationId: string
  ) => {
    const conversation =
      conversations.find(
        (conversation) =>
          conversation.id ===
          conversationId
      );

    if (!conversation) return;

    setEditingConversationId(
      conversation.id
    );

    setEditingTitle(
      conversation.title
    );
  };

  const cancelRename = () => {
    setEditingConversationId(null);

    setEditingTitle("");
  };

  const handleRename = async () => {
    if (
      !editingConversationId
    ) {
      return;
    }

    if (!editingTitle.trim()) {
      cancelRename();
      return;
    }

    try {
      const updated =
        await renameConversation(
          editingConversationId,
          editingTitle.trim()
        );

      updateConversation(updated);

      cancelRename();
    } catch (err) {
      console.error(
        "Rename failed",
        err
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "F2")
        return;

      if (!activeConversationId)
        return;

      event.preventDefault();

      startRename(
        activeConversationId
      );
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    activeConversationId,
    conversations,
  ]);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };

    window.addEventListener(
      "click",
      handleClick
    );
  
    return () =>
      window.removeEventListener(
        "click",
        handleClick
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
            width: 280,
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
          className="flex flex-col h-full border-r border-white/[0.06] bg-[#080808] overflow-hidden flex-shrink-0"
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>

              <span className="text-[15px] font-bold text-white tracking-tight">
                Dasaiko
              </span>
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* New Workspace */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleNewWorkspace}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[13px] font-medium hover:bg-primary/15 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Workspace
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-2 flex-shrink-0">
            {(["library", "threads"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium transition-all capitalize",
                    activeTab === tab
                      ? "bg-surface text-white border border-white/[0.08]"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {tab === "library" ? (
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}

                  {tab}
                </button>
              )
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === "library" ? (
                <motion.div
                  key="library"
                  variants={slideInLeft}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full py-2"
                >
                  <KnowledgeLibrary />
                </motion.div>
              ) : (
                <motion.div
                  key="threads"
                  variants={slideInLeft}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full py-2 px-2 overflow-y-auto"
                >
                  {pinnedConversations.length > 0 && (
                    <>
                      <div className="px-3 pb-2">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                          ⭐ Pinned
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
                                  conversation.id
                                )
                              }
                              onTogglePin={() =>
                                handleTogglePin(
                                  conversation.id
                                )
                              }
                              
                              onContextMenu={(x,y) => {
                                setContextMenu({
                                  x,
                                  y,
                                  conversationId: conversation.id,
                                });
                              }}
                            />
                          )
                        )}
                      </div>

                      <div className="border-t border-white/[0.06] my-3" />
                    </>
                  )}

                  <div className="px-3 pb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      All Chats
                    </p>
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
                              conversation.id
                            )
                          }
                          onTogglePin={() =>
                            handleTogglePin(
                              conversation.id
                            )
                          }
                          onContextMenu={(x,y) => {
                            setContextMenu({
                              x,
                              y,
                              conversationId: conversation.id,
                            });
                          }}
                        />
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom */}
          <div className="px-3 py-3 border-t border-white/[0.06] space-y-1 flex-shrink-0">
            <button
              onClick={() =>
                navigate("/settings")
              }
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                location.pathname ===
                  "/settings"
                  ? "text-white bg-hover"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-hover"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <div className="pt-2">
              <PrivacyBadge />
            </div>
          </div>
        </motion.aside>
      )}

      {contextMenu && (
        <ConversationMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPinned={
            conversations.find(
              (c) =>
                c.id ===
                contextMenu.conversationId
            )?.isPinned ?? false
          }
          onRename={() => {
            startRename(
              contextMenu.conversationId
            );

            setContextMenu(null);
          }}
          onTogglePin={() => {
            handleTogglePin(
              contextMenu.conversationId
            );

            setContextMenu(null);
          }}
          onDelete={async () => {
            if (!contextMenu) return;

            const conversationId =
              contextMenu.conversationId;

            try {
              await deleteConversation(
                conversationId
              );

              removeConversation(
                conversationId
              );

              if (
                activeConversationId ===
                conversationId
              ) {
                setActiveConversation(null);
                setMessages([]);
              }
            } catch (error) {
              console.error("Error deleting conversation:", error);
            }

            setContextMenu(null);
          }}
        />
      )}
    </AnimatePresence>
  );
}

export function SidebarToggle() {
  const {
    sidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  if (sidebarOpen) return null;

  return (
    <button
      onClick={toggleSidebar}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-surface border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all shadow-card"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}