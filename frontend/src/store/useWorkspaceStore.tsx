import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

import type {
  ChatMessage,
  Conversation,
  Document,
  EvidenceChunk,
} from "@/types";


const SELECTED_DOCUMENT_STORAGE_KEY =
  "dasaiko.selectedDocumentByConversation";


type SelectedDocumentMap =
  Record<string, number | null>;


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadSelectedDocumentMap():
  SelectedDocumentMap {

  if (
    typeof window === "undefined"
  ) {
    return {};
  }


  try {

    const raw =
      window.localStorage.getItem(
        SELECTED_DOCUMENT_STORAGE_KEY,
      );


    if (!raw) {
      return {};
    }


    const parsed =
      JSON.parse(raw);


    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {};
    }


    return parsed as SelectedDocumentMap;

  } catch {

    return {};

  }
}


function saveSelectedDocumentMap(
  map: SelectedDocumentMap,
) {

  if (
    typeof window === "undefined"
  ) {
    return;
  }


  try {

    window.localStorage.setItem(
      SELECTED_DOCUMENT_STORAGE_KEY,
      JSON.stringify(map),
    );

  } catch {

    /*
     * LocalStorage should never break
     * the application.
     */

  }
}


/* =========================================================
   STATE
========================================================= */

interface WorkspaceState {

  activeConversationId:
    string | null;

  activeDocumentId:
    string | null;

  selectedDocumentId:
    number | null;

  selectedPdf:
    string | null;

  selectedEvidence:
    EvidenceChunk | null;

  messages:
    ChatMessage[];

  documents:
    Document[];

  conversations:
    Conversation[];

  activeEvidence:
    EvidenceChunk[];

  isQuerying:
    boolean;

  sidebarOpen:
    boolean;
}


/* =========================================================
   ACTIONS
========================================================= */

interface WorkspaceActions {

  setActiveConversation: (
    id: string | null,
  ) => void;

  setActiveDocument: (
    id: string | null,
  ) => void;

  setSelectedDocumentId: (
    id: number | null,
  ) => void;

  setSelectedPdf: (
    path: string | null,
  ) => void;

  setSelectedEvidence: (
    evidence: EvidenceChunk | null,
  ) => void;

  addMessage: (
    msg: ChatMessage,
  ) => void;

  setMessages: (
    updater:
      | ChatMessage[]
      | ((
          prev: ChatMessage[],
        ) => ChatMessage[]),
  ) => void;

  setDocuments: (
    documents: Document[],
  ) => void;

  setConversations: (
    conversations: Conversation[],
  ) => void;

  addConversation: (
    conversation: Conversation,
  ) => void;

  removeConversation: (
    id: string,
  ) => void;

  updateConversation: (
    conversation: Conversation,
  ) => void;

  setActiveEvidence: (
    ev: EvidenceChunk[],
  ) => void;

  setIsQuerying: (
    value: boolean,
  ) => void;

  openSidebar: () => void;

  closeSidebar: () => void;

  toggleSidebar: () => void;

  addDocument: (
    doc: Document,
  ) => void;

  removeDocument: (
    id: string,
  ) => void;

  updateDocument: (
    id: string,
    updates: Partial<Document>,
  ) => void;

  clearWorkspace: () => void;
}


type WorkspaceStore =
  WorkspaceState &
  WorkspaceActions;


const WorkspaceContext =
  createContext<WorkspaceStore | null>(
    null,
  );


/* =========================================================
   PROVIDER
========================================================= */

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  /* =======================================================
     ACTIVE CONVERSATION
  ======================================================== */

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(
    null,
  );


  const activeConversationIdRef =
    useRef<string | null>(
      null,
    );


  /* =======================================================
     ACTIVE DOCUMENT
  ======================================================== */

  const [
    activeDocumentId,
    setActiveDocumentId,
  ] = useState<string | null>(
    null,
  );


  /* =======================================================
     SELECTED DOCUMENT
  ======================================================== */

  const [
    selectedDocumentId,
    setSelectedDocumentIdState,
  ] = useState<number | null>(
    null,
  );


  const selectedDocumentMapRef =
    useRef<SelectedDocumentMap>(
      loadSelectedDocumentMap(),
    );


  /* =======================================================
     PDF
  ======================================================== */

  const [
    selectedPdf,
    setSelectedPdfState,
  ] = useState<string | null>(
    null,
  );


  /* =======================================================
     SELECTED EVIDENCE
  ======================================================== */

  const [
    selectedEvidence,
    setSelectedEvidenceState,
  ] = useState<EvidenceChunk | null>(
    null,
  );


  /* =======================================================
     MESSAGES
  ======================================================== */

  const [
    messages,
    setMessagesState,
  ] = useState<ChatMessage[]>(
    [],
  );


  /* =======================================================
     DOCUMENTS
  ======================================================== */

  const [
    documents,
    setDocumentsState,
  ] = useState<Document[]>(
    [],
  );


  /* =======================================================
     CONVERSATIONS
  ======================================================== */

  const [
    conversations,
    setConversationsState,
  ] = useState<Conversation[]>(
    [],
  );


  const conversationsRef =
    useRef<Conversation[]>(
      [],
    );


  /* =======================================================
     EVIDENCE
  ======================================================== */

  const [
    activeEvidence,
    setActiveEvidence,
  ] = useState<EvidenceChunk[]>(
    [],
  );


  /* =======================================================
     QUERYING
  ======================================================== */

  const [
    isQuerying,
    setIsQuerying,
  ] = useState(false);


  /* =======================================================
     SIDEBAR
  ======================================================== */

  /*
   * The workspace starts as a clean canvas.
   *
   * The sidebar only appears once there is
   * something meaningful to navigate.
   */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  /* =========================================================
     ACTIVE CONVERSATION
  ========================================================= */

  const setActiveConversation =
    useCallback(
      (
        id: string | null,
      ) => {

        activeConversationIdRef.current =
          id;


        setActiveConversationId(
          id,
        );


        /*
         * No active conversation means
         * we are back at the empty workspace.
         */

        if (
          id === null
        ) {

          setSelectedDocumentIdState(
            null,
          );

          return;
        }


        const conversation =
          conversationsRef.current.find(
            (item) =>
              item.id === id,
          );


        const databaseDocumentId =
          conversation
            ?.selectedDocumentId
            ?? null;


        const storedDocumentId =
          selectedDocumentMapRef.current[
            id
          ] ?? null;


        const restoredDocumentId =
          databaseDocumentId ??
          storedDocumentId;


        setSelectedDocumentIdState(
          restoredDocumentId,
        );

      },
      [],
    );


  /* =========================================================
     ACTIVE DOCUMENT
  ========================================================= */

  const setActiveDocument =
    useCallback(
      (
        id: string | null,
      ) => {

        setActiveDocumentId(
          id,
        );

      },
      [],
    );


  /* =========================================================
     SELECTED DOCUMENT
  ========================================================= */

  const setSelectedDocumentId =
    useCallback(
      (
        id: number | null,
      ) => {

        setSelectedDocumentIdState(
          id,
        );


        const conversationId =
          activeConversationIdRef.current;


        /*
         * There is no conversation yet.
         *
         * This is normal during the initial
         * document upload state.
         */

        if (
          !conversationId
        ) {

          return;
        }


        selectedDocumentMapRef.current =
          {
            ...selectedDocumentMapRef.current,

            [conversationId]:
              id,
          };


        saveSelectedDocumentMap(
          selectedDocumentMapRef.current,
        );


        conversationsRef.current =
          conversationsRef.current.map(
            (
              conversation,
            ) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,

                    selectedDocumentId:
                      id,
                  }
                : conversation,
          );


        setConversationsState(
          conversationsRef.current,
        );

      },
      [],
    );


  /* =========================================================
     PDF
  ========================================================= */

  const setSelectedPdf =
    useCallback(
      (
        path: string | null,
      ) => {

        setSelectedPdfState(
          path,
        );

      },
      [],
    );


  /* =========================================================
     SELECTED EVIDENCE
  ========================================================= */

  const setSelectedEvidence =
    useCallback(
      (
        evidence:
          EvidenceChunk | null,
      ) => {

        setSelectedEvidenceState(
          evidence,
        );

      },
      [],
    );


  /* =========================================================
     MESSAGES
  ========================================================= */

  const addMessage =
    useCallback(
      (
        msg: ChatMessage,
      ) => {

        setMessagesState(
          (prev) => [
            ...prev,
            msg,
          ],
        );

      },
      [],
    );


  const setMessages =
    useCallback(
      (
        updater:
          | ChatMessage[]
          | ((
              prev: ChatMessage[],
            ) => ChatMessage[]),
      ) => {

        if (
          typeof updater ===
          "function"
        ) {

          setMessagesState(
            updater,
          );

        } else {

          setMessagesState(
            updater,
          );

        }

      },
      [],
    );


  /* =========================================================
     DOCUMENTS
  ========================================================= */

  const setDocuments =
    useCallback(
      (
        nextDocuments:
          Document[],
      ) => {

        setDocumentsState(
          nextDocuments,
        );

      },
      [],
    );


  /* =========================================================
     CONVERSATIONS
  ========================================================= */

  const setConversations =
    useCallback(
      (
        nextConversations:
          Conversation[],
      ) => {

        conversationsRef.current =
          nextConversations;


        const nextSelectedMap =
          {
            ...selectedDocumentMapRef.current,
          };


        for (
          const conversation of
          nextConversations
        ) {

          if (
            conversation
              .selectedDocumentId !==
            undefined
          ) {

            nextSelectedMap[
              conversation.id
            ] =
              conversation
                .selectedDocumentId
                ?? null;

          }

        }


        selectedDocumentMapRef.current =
          nextSelectedMap;


        saveSelectedDocumentMap(
          nextSelectedMap,
        );


        setConversationsState(
          nextConversations,
        );


        const activeId =
          activeConversationIdRef.current;


        if (
          !activeId
        ) {

          return;
        }


        const activeConversation =
          nextConversations.find(
            (
              conversation,
            ) =>
              conversation.id ===
              activeId,
          );


        if (
          !activeConversation
        ) {

          return;
        }


        const restoredDocumentId =
          activeConversation
            .selectedDocumentId
            ?? null;


        setSelectedDocumentIdState(
          restoredDocumentId,
        );

      },
      [],
    );


  /* =========================================================
     ADD CONVERSATION
  ========================================================= */

  const addConversation =
    useCallback(
      (
        conversation:
          Conversation,
      ) => {

        conversationsRef.current =
          [
            conversation,
            ...conversationsRef.current,
          ];


        setConversationsState(
          conversationsRef.current,
        );

      },
      [],
    );


  /* =========================================================
     REMOVE CONVERSATION
  ========================================================= */

  const removeConversation =
    useCallback(
      (
        id: string,
      ) => {

        conversationsRef.current =
          conversationsRef.current.filter(
            (
              conversation,
            ) =>
              conversation.id !==
              id,
          );


        setConversationsState(
          conversationsRef.current,
        );


        const nextMap =
          {
            ...selectedDocumentMapRef.current,
          };


        delete nextMap[id];


        selectedDocumentMapRef.current =
          nextMap;


        saveSelectedDocumentMap(
          nextMap,
        );


        if (
          activeConversationIdRef.current ===
          id
        ) {

          activeConversationIdRef.current =
            null;


          setActiveConversationId(
            null,
          );


          setSelectedDocumentIdState(
            null,
          );

        }

      },
      [],
    );


  /* =========================================================
     UPDATE CONVERSATION
  ========================================================= */

  const updateConversation =
    useCallback(
      (
        updatedConversation:
          Conversation,
      ) => {

        conversationsRef.current =
          conversationsRef.current.map(
            (
              conversation,
            ) =>
              conversation.id ===
              updatedConversation.id
                ? {
                    ...conversation,
                    ...updatedConversation,
                  }
                : conversation,
          );


        setConversationsState(
          conversationsRef.current,
        );


        if (
          updatedConversation.id ===
          activeConversationIdRef.current
        ) {

          const restored =
            updatedConversation
              .selectedDocumentId
              ?? null;


          setSelectedDocumentIdState(
            restored,
          );


          selectedDocumentMapRef.current =
            {
              ...selectedDocumentMapRef.current,

              [updatedConversation.id]:
                restored,
            };


          saveSelectedDocumentMap(
            selectedDocumentMapRef.current,
          );

        }

      },
      [],
    );


  /* =========================================================
     SIDEBAR
  ========================================================= */

  const openSidebar =
    useCallback(
      () => {

        setSidebarOpen(
          true,
        );

      },
      [],
    );


  const closeSidebar =
    useCallback(
      () => {

        setSidebarOpen(
          false,
        );

      },
      [],
    );


  const toggleSidebar =
    useCallback(
      () => {

        setSidebarOpen(
          (prev) =>
            !prev,
        );

      },
      [],
    );


  /* =========================================================
     ADD DOCUMENT
  ========================================================= */

  const addDocument =
    useCallback(
      (
        doc: Document,
      ) => {

        setDocumentsState(
          (prev) => [
            doc,
            ...prev,
          ],
        );

      },
      [],
    );


  /* =========================================================
     REMOVE DOCUMENT
  ========================================================= */

  const removeDocument =
    useCallback(
      (
        id: string,
      ) => {

        setDocumentsState(
          (prev) =>
            prev.filter(
              (doc) =>
                doc.id !== id,
            ),
        );

      },
      [],
    );


  /* =========================================================
     UPDATE DOCUMENT
  ========================================================= */

  const updateDocument =
    useCallback(
      (
        id: string,
        updates:
          Partial<Document>,
      ) => {

        setDocumentsState(
          (prev) =>
            prev.map(
              (doc) =>
                doc.id === id
                  ? {
                      ...doc,
                      ...updates,
                    }
                  : doc,
            ),
        );

      },
      [],
    );


  /* =========================================================
     CLEAR / NEW WORKSPACE
  ========================================================= */

  const clearWorkspace =
    useCallback(
      () => {

        /*
         * IMPORTANT:
         *
         * "New Workspace" means:
         *
         *     start a NEW research session
         *
         * NOT:
         *
         *     delete the user's documents
         *     delete their conversations
         *
         * The document library and conversation
         * history remain available in the sidebar
         * once the new workspace becomes active.
         */


        /* -----------------------------------------------
           RESET ACTIVE SESSION
        ------------------------------------------------ */

        activeConversationIdRef.current =
          null;


        setActiveConversationId(
          null,
        );


        setActiveDocumentId(
          null,
        );


        setSelectedDocumentIdState(
          null,
        );


        setSelectedPdfState(
          null,
        );


        setSelectedEvidenceState(
          null,
        );


        setMessagesState(
          [],
        );


        setActiveEvidence(
          [],
        );


        setIsQuerying(
          false,
        );


        /* -----------------------------------------------
           CLOSE SIDEBAR
        ------------------------------------------------ */

        /*
         * This is the key UX change.
         *
         * New Workspace returns the user to
         * the clean centered canvas.
         */

        setSidebarOpen(
          false,
        );


        /*
         * DO NOT clear:
         *
         * documents
         * conversations
         *
         * Those belong to the user's workspace
         * and should remain available.
         */


      },
      [],
    );


  /* =========================================================
     PROVIDER
  ========================================================= */

  return (

    <WorkspaceContext.Provider
      value={{

        activeConversationId,

        activeDocumentId,

        selectedDocumentId,

        selectedPdf,

        selectedEvidence,

        messages,

        documents,

        conversations,

        activeEvidence,

        isQuerying,

        sidebarOpen,

        setActiveConversation,

        setActiveDocument,

        setSelectedDocumentId,

        setSelectedPdf,

        setSelectedEvidence,

        addMessage,

        setMessages,

        setDocuments,

        setConversations,

        addConversation,

        removeConversation,

        updateConversation,

        setActiveEvidence,

        setIsQuerying,

        openSidebar,

        closeSidebar,

        toggleSidebar,

        addDocument,

        removeDocument,

        updateDocument,

        clearWorkspace,

      }}
    >

      {children}

    </WorkspaceContext.Provider>

  );
}


/* =========================================================
   HOOK
========================================================= */

export function useWorkspaceStore():
  WorkspaceStore {

  const context =
    useContext(
      WorkspaceContext,
    );


  if (
    !context
  ) {

    throw new Error(
      "useWorkspaceStore must be used within WorkspaceProvider",
    );

  }


  return context;
}