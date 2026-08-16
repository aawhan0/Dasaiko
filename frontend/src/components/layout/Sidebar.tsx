import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  LayoutDashboard,
  Settings,
  Plus,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  cn,
} from "@/utils/cn";

import {
  KnowledgeLibrary,
} from "@/components/library/KnowledgeLibrary";

import {
  ConversationItem,
} from "@/components/conversation/ConversationItem";

import {
  ConversationMenu,
} from "@/components/conversation/ConversationMenu";

import {
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

import {
  createConversation,
  toggleConversationPin,
  renameConversation,
  deleteConversation,
} from "@/services/conversations";

import {
  listMessages,
} from "@/services/messages";


export function Sidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const {
    conversations,
    activeConversationId,

    documents,

    setActiveConversation,

    addConversation,
    updateConversation,
    removeConversation,

    setMessages,

    closeSidebar,
  } = useWorkspaceStore();


  /* =====================================================
     ACTIVE TAB
  ====================================================== */

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "library" | "threads"
  >("threads");


  /* =====================================================
     EDITING
  ====================================================== */

  const [
    editingConversationId,
    setEditingConversationId,
  ] = useState<string | null>(
    null,
  );


  const [
    editingTitle,
    setEditingTitle,
  ] = useState("");


  /* =====================================================
     CONTEXT MENU
  ====================================================== */

  const [
    contextMenu,
    setContextMenu,
  ] = useState<{
    x: number;
    y: number;
    conversationId: string;
  } | null>(null);


  /* =====================================================
     DOCUMENT ARRIVAL
     
     When a document is uploaded, automatically switch
     the sidebar to Library so the new document is visible.
  ====================================================== */

  useEffect(() => {

    if (
      documents.length > 0
    ) {

      setActiveTab(
        "library",
      );

    }

  }, [
    documents.length,
  ]);


  /* =====================================================
     CONVERSATION GROUPS
  ====================================================== */

  const pinnedConversations =
    conversations.filter(
      (
        conversation,
      ) =>
        conversation.isPinned,
    );


  const otherConversations =
    conversations.filter(
      (
        conversation,
      ) =>
        !conversation.isPinned,
    );


  /* =====================================================
     CREATE NEW WORKSPACE
     
     IMPORTANT:

     Creating a workspace does NOT mean the sidebar
     should remain visible.

     We explicitly close the sidebar here.

     The first submitted query will reopen it through
     MessageInput.
  ====================================================== */

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


        setActiveTab(
          "threads",
        );


        /*
         * Hide sidebar immediately.
         *
         * AppShell listens to sidebarOpen and will
         * animate it completely out of the layout.
         */

        closeSidebar();

      } catch (error) {

        console.error(
          "Failed to create workspace:",
          error,
        );

      }

    };


  /* =====================================================
     OPEN CONVERSATION
  ====================================================== */

  const handleOpenConversation =
    async (
      conversationId: string,
    ) => {

      try {

        setActiveConversation(
          conversationId,
        );


        const messages =
          await listMessages(
            conversationId,
          );


        setMessages(
          messages,
        );

      } catch (error) {

        console.error(
          "Failed to open conversation:",
          error,
        );

      }

    };


  /* =====================================================
     PIN / UNPIN
  ====================================================== */

  const handleTogglePin =
    async (
      conversationId: string,
    ) => {

      try {

        const updated =
          await toggleConversationPin(
            conversationId,
          );


        updateConversation(
          updated,
        );

      } catch (error) {

        console.error(
          "Failed to toggle pin:",
          error,
        );

      }

    };


  /* =====================================================
     START RENAME
  ====================================================== */

  const startRename = (
    conversationId: string,
  ) => {

    const conversation =
      conversations.find(
        (
          item,
        ) =>
          item.id ===
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


  /* =====================================================
     CANCEL RENAME
  ====================================================== */

  const cancelRename = () => {

    setEditingConversationId(
      null,
    );


    setEditingTitle(
      "",
    );

  };


  /* =====================================================
     RENAME
  ====================================================== */

  const handleRename =
    async () => {

      if (
        !editingConversationId
      ) {
        return;
      }


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


        updateConversation(
          updated,
        );


        cancelRename();

      } catch (error) {

        console.error(
          "Rename failed:",
          error,
        );

      }

    };


  /* =====================================================
     F2 RENAME
  ====================================================== */

  useEffect(() => {

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {

      if (
        event.key !== "F2"
      ) {
        return;
      }


      if (
        !activeConversationId
      ) {
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


  /* =====================================================
     CLOSE CONTEXT MENU
  ====================================================== */

  useEffect(() => {

    const handleClick = () => {

      setContextMenu(
        null,
      );

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

    <motion.aside
      initial={false}
      className="
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        border-r
        border-white/[0.07]
        bg-[#070707]
      "
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-2
          border-b
          border-white/[0.06]
          px-3
          py-3
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
            min-w-0
            flex-1
            items-center
            gap-2.5
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            px-3
            py-2.5
            text-left
            transition-all
            duration-200
            hover:border-primary/20
            hover:bg-primary/[0.05]
          "
        >

          <span
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-white/[0.08]
              bg-white/[0.035]
            "
          >

            <Plus
              className="
                h-4
                w-4
                text-zinc-500
                transition-colors
                group-hover:text-primary
              "
            />

          </span>


          <span
            className="
              min-w-0
              flex-1
              truncate
              text-[11px]
              font-semibold
              text-zinc-400
              transition-colors
              group-hover:text-zinc-200
            "
          >
            New Workspace
          </span>

        </motion.button>


        <button
          type="button"
          onClick={
            closeSidebar
          }
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            text-zinc-600
            transition-all
            duration-200
            hover:border-white/[0.14]
            hover:bg-white/[0.06]
            hover:text-zinc-300
          "
        >

          <ChevronLeft
            className="
              h-4
              w-4
            "
          />

        </button>

      </div>


      {/* =================================================
          TABS
      ================================================== */}

      <div
        className="
          shrink-0
          px-3
          pb-3
          pt-3
        "
      >

        <div
          className="
            grid
            grid-cols-2
            gap-1
            rounded-xl
            border
            border-white/[0.05]
            bg-white/[0.012]
            p-1
          "
        >

          {(
            [
              "threads",
              "library",
            ] as const
          ).map(
            (
              tab,
            ) => {

              const isActive =
                activeTab ===
                tab;


              return (

                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab,
                    )
                  }
                  className={cn(
                    `
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      capitalize
                      transition-all
                      duration-200
                    `,

                    isActive
                      ? `
                        border
                        border-white/[0.08]
                        bg-white/[0.055]
                        text-zinc-200
                      `
                      : `
                        border
                        border-transparent
                        text-zinc-700
                        hover:text-zinc-400
                      `,
                  )}
                >

                  {tab ===
                  "library" ? (

                    <LayoutDashboard
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                  ) : (

                    <MessageSquare
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                  )}

                  {tab}

                </button>

              );

            },
          )}

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

        {activeTab ===
        "library" ? (

          <div
            className="
              h-full
              overflow-hidden
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
              [scrollbar-width:thin]
              [scrollbar-color:rgba(255,255,255,0.08)_transparent]
            "
          >

            {/* =================================================
                PINNED
            ================================================== */}

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
                    "
                  />

                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-zinc-600
                    "
                  >
                    Pinned
                  </p>

                </div>


                <div
                  className="
                    space-y-1
                  "
                >

                  {pinnedConversations.map(
                    (
                      conversation,
                    ) => (

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
                    bg-white/[0.05]
                  "
                />

              </>

            )}


            {/* =================================================
                ALL CHATS
            ================================================== */}

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
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-zinc-600
                "
              >
                All Chats
              </p>


              <span
                className="
                  font-mono
                  text-[9px]
                  font-semibold
                  text-zinc-700
                "
              >
                {
                  otherConversations.length
                }
              </span>

            </div>


            <div
              className="
                space-y-1
              "
            >

              {otherConversations.map(
                (
                  conversation,
                ) => (

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


            {/* =================================================
                EMPTY
            ================================================== */}

            {conversations.length ===
              0 && (

              <div
                className="
                  px-5
                  py-10
                  text-center
                "
              >

                <MessageSquare
                  className="
                    mx-auto
                    h-5
                    w-5
                    text-zinc-800
                  "
                />


                <p
                  className="
                    mt-3
                    text-[10px]
                    font-semibold
                    text-zinc-600
                  "
                >
                  No conversations yet
                </p>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =================================================
          SETTINGS
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/[0.06]
          px-3
          py-3
        "
      >

        <button
          type="button"
          onClick={() =>
            navigate(
              "/settings",
            )
          }
          className={cn(
            `
              group
              flex
              w-full
              items-center
              gap-2.5
              rounded-xl
              border
              px-3
              py-2.5
              text-[11px]
              font-semibold
              transition-all
              duration-200
            `,

            location.pathname ===
              "/settings"
              ? `
                border-white/[0.10]
                bg-white/[0.05]
                text-zinc-200
              `
              : `
                border-transparent
                text-zinc-600
                hover:border-white/[0.06]
                hover:bg-white/[0.03]
                hover:text-zinc-300
              `,
          )}
        >

          <Settings
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:rotate-45
            "
          />

          <span>
            Settings
          </span>

        </button>

      </div>


      {/* =================================================
          CONTEXT MENU
      ================================================== */}

      {contextMenu && (

        <ConversationMenu
          x={
            contextMenu.x
          }

          y={
            contextMenu.y
          }

          isPinned={
            conversations.find(
              (
                conversation,
              ) =>
                conversation.id ===
                contextMenu.conversationId,
            )?.isPinned ??
            false
          }

          onRename={() => {

            startRename(
              contextMenu.conversationId,
            );

            setContextMenu(
              null,
            );

          }}

          onTogglePin={() => {

            handleTogglePin(
              contextMenu.conversationId,
            );

            setContextMenu(
              null,
            );

          }}

          onDelete={async () => {

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


                setMessages(
                  [],
                );

              }

            } catch (error) {

              console.error(
                "Error deleting conversation:",
                error,
              );

            }


            setContextMenu(
              null,
            );

          }}
        />

      )}

    </motion.aside>
  );
}