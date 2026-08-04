import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Plus,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Pin,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { KnowledgeLibrary } from "@/components/library/KnowledgeLibrary";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { createConversation, toggleConversationPin } from "@/services/conversations";
import { listMessages } from "@/services/messages";
import { formatRelativeDate } from "@/utils/formatters";
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
    setMessages,
    sidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<
    "library" | "threads"
  >("library");

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

  const handleTogglePin = async (
    conversationId: string
  ) => {
    try {
      const updatedConversation =
        await toggleConversationPin(
          conversationId
        );

      updateConversation(
        updatedConversation
      );
    } catch (err) {
      console.error(
        "Failed to toggle pin",
        err
      );
    }
  };

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
                  className="h-full py-2 px-2 space-y-1 overflow-y-auto"
                >
                  {(() => {
                    console.table(conversations);
                    return null;
                  })()}

                  {pinnedConversations.length > 0 && (
                    <>
                      <div className="px-3 pb-2">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                          ⭐ Pinned
                        </p>
                      </div>
                                    
                      {pinnedConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={async () => {
                            setActiveConversation(conversation.id);

                            const messages =
                              await listMessages(
                                conversation.id
                              );

                            setMessages(messages);
                         }}
                          className={cn(
                            "group w-full text-left px-3 py-2.5 rounded-lg transition-colors border",
                            activeConversationId ===
                              conversation.id
                              ? "bg-primary/10 border-primary/20"
                              : "border-transparent hover:bg-hover"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                             <Pin className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />

                             <p
                               className={cn(
                                 "text-[13px] font-medium truncate",
                                  activeConversationId ===
                                   conversation.id
                                   ? "text-white"
                                   : "text-zinc-300"
                                )}
                             >
                                {conversation.title}
                              </p>
                           </div>
                              
                            <button
                             onClick={async (e) => {
                               e.stopPropagation();

                                const updated =
                                  await toggleConversationPin(
                                    conversation.id
                                  );
                                
                               updateConversation(updated);
                             }}
                              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-yellow-400 transition"
                            >
                             <Pin className="w-3.5 h-3.5 fill-current" />
                           </button>
                         </div>
                           
                          <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                            {conversation.messageCount} msgs ·{" "}
                           {formatRelativeDate(
                              conversation.lastActivityAt
                            )}
                          </p>
                        </button>
                      ))}

                      <div className="border-t border-white/[0.06] my-3" />
                    </>
                  )}

                  <div className="px-3 pb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
    All Chats
                    </p>
                  </div>

                  {otherConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={async () => {
                        setActiveConversation(conversation.id);
                      
                        const messages =
                          await listMessages(
                            conversation.id
                          );
                        
                        setMessages(messages);
                     }}
                     className={cn(
                       "group w-full text-left px-3 py-2.5 rounded-lg transition-colors border",
                       activeConversationId ===
                         conversation.id
                         ? "bg-primary/10 border-primary/20"
                         : "border-transparent hover:bg-hover"
                     )}
                   >
                     <div className="flex items-start justify-between gap-2">
                       <p
                         className={cn(
                           "text-[13px] font-medium truncate",
                           activeConversationId ===
                              conversation.id
                              ? "text-white"
                              : "text-zinc-300"
                          )}
                        >
                          {conversation.title}
                        </p>
                        
                       <button
                         onClick={async (e) => {
                           e.stopPropagation();
                          
                           const updated =
                              await toggleConversationPin(
                                conversation.id
                             );
                          
                           updateConversation(updated);
                        }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-yellow-400 transition"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                        
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                        {conversation.messageCount} msgs ·{" "}
                       {formatRelativeDate(
                          conversation.lastActivityAt
                        )}
                      </p>
                    </button>
                  ))}





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