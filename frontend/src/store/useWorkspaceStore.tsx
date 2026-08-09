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
        SELECTED_DOCUMENT_STORAGE_KEY
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

    // LocalStorage should never
    // break the application.

  }
}


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


interface WorkspaceActions {

  setActiveConversation: (
    id: string | null
  ) => void;

  setActiveDocument: (
    id: string | null
  ) => void;

  setSelectedDocumentId: (
    id: number | null
  ) => void;

  setSelectedPdf: (
    path: string | null
  ) => void;

  setSelectedEvidence: (
    evidence: EvidenceChunk | null
  ) => void;

  addMessage: (
    msg: ChatMessage
  ) => void;

  setMessages: (
    updater:
      | ChatMessage[]
      | ((
          prev: ChatMessage[]
        ) => ChatMessage[])
  ) => void;

  setDocuments: (
    documents: Document[]
  ) => void;

  setConversations: (
    conversations: Conversation[]
  ) => void;

  addConversation: (
    conversation: Conversation
  ) => void;

  removeConversation: (
    id: string
  ) => void;

  updateConversation: (
    conversation: Conversation
  ) => void;

  setActiveEvidence: (
    ev: EvidenceChunk[]
  ) => void;

  setIsQuerying: (
    value: boolean
  ) => void;

  toggleSidebar: () => void;

  addDocument: (
    doc: Document
  ) => void;

  removeDocument: (
    id: string
  ) => void;

  updateDocument: (
    id: string,
    updates: Partial<Document>
  ) => void;
}


type WorkspaceStore =
  WorkspaceState &
  WorkspaceActions;


const WorkspaceContext =
  createContext<WorkspaceStore | null>(
    null
  );


export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(
    null
  );


  const activeConversationIdRef =
    useRef<string | null>(null);


  const [
    activeDocumentId,
    setActiveDocumentId,
  ] = useState<string | null>(
    null
  );


  const [
    selectedDocumentId,
    setSelectedDocumentIdState,
  ] = useState<number | null>(
    null
  );


  const selectedDocumentMapRef =
    useRef<SelectedDocumentMap>(
      loadSelectedDocumentMap()
    );


  const [
    selectedPdf,
    setSelectedPdfState,
  ] = useState<string | null>(
    null
  );


  const [
    selectedEvidence,
    setSelectedEvidenceState,
  ] = useState<EvidenceChunk | null>(
    null
  );


  const [
    messages,
    setMessagesState,
  ] = useState<ChatMessage[]>(
    []
  );


  const [
    documents,
    setDocumentsState,
  ] = useState<Document[]>(
    []
  );


  const [
    conversations,
    setConversationsState,
  ] = useState<Conversation[]>(
    []
  );


  const conversationsRef =
    useRef<Conversation[]>(
      []
    );


  const [
    activeEvidence,
    setActiveEvidence,
  ] = useState<EvidenceChunk[]>(
    []
  );


  const [
    isQuerying,
    setIsQuerying,
  ] = useState(false);


  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);


  // -----------------------------------------
  // Active Conversation
  // -----------------------------------------

  const setActiveConversation =
    useCallback(
      (
        id: string | null
      ) => {

        activeConversationIdRef.current =
          id;


        setActiveConversationId(
          id
        );


        if (id === null) {

          setSelectedDocumentIdState(
            null
          );

          return;

        }


        const conversation =
          conversationsRef.current.find(
            (item) =>
              item.id === id
          );


        const databaseDocumentId =
          conversation
            ?.selectedDocumentId
            ?? null;


        const storedDocumentId =
          selectedDocumentMapRef.current[
            id
          ]
          ?? null;


        const restoredDocumentId =
          databaseDocumentId ??
          storedDocumentId;


        setSelectedDocumentIdState(
          restoredDocumentId
        );

      },
      []
    );


  // -----------------------------------------
  // Active Document
  // -----------------------------------------

  const setActiveDocument =
    useCallback(
      (
        id: string | null
      ) => {

        setActiveDocumentId(id);

      },
      []
    );


  // -----------------------------------------
  // Selected Research Paper
  // -----------------------------------------

  const setSelectedDocumentId =
    useCallback(
      (
        id: number | null
      ) => {

        setSelectedDocumentIdState(
          id
        );


        const conversationId =
          activeConversationIdRef.current;


        if (!conversationId) {
          return;
        }


        selectedDocumentMapRef.current = {
          ...selectedDocumentMapRef.current,
          [conversationId]: id,
        };


        saveSelectedDocumentMap(
          selectedDocumentMapRef.current
        );


        conversationsRef.current =
          conversationsRef.current.map(
            (conversation) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,
                    selectedDocumentId:
                      id,
                  }
                : conversation
          );


        setConversationsState(
          conversationsRef.current
        );

      },
      []
    );


  // -----------------------------------------
  // PDF
  // -----------------------------------------

  const setSelectedPdf =
    useCallback(
      (
        path: string | null
      ) => {

        setSelectedPdfState(
          path
        );

      },
      []
    );


  // -----------------------------------------
  // Evidence
  // -----------------------------------------

  const setSelectedEvidence =
    useCallback(
      (
        evidence: EvidenceChunk | null
      ) => {

        setSelectedEvidenceState(
          evidence
        );

      },
      []
    );


  // -----------------------------------------
  // Messages
  // -----------------------------------------

  const addMessage =
    useCallback(
      (
        msg: ChatMessage
      ) => {

        setMessagesState(
          (prev) => [
            ...prev,
            msg,
          ]
        );

      },
      []
    );


  const setMessages =
    useCallback(
      (
        updater:
          | ChatMessage[]
          | ((
              prev: ChatMessage[]
            ) => ChatMessage[])
      ) => {

        if (
          typeof updater ===
          "function"
        ) {

          setMessagesState(
            updater
          );

        } else {

          setMessagesState(
            updater
          );

        }

      },
      []
    );


  // -----------------------------------------
  // Documents
  // -----------------------------------------

  const setDocuments =
    useCallback(
      (
        nextDocuments: Document[]
      ) => {

        setDocumentsState(
          nextDocuments
        );

      },
      []
    );


  // -----------------------------------------
  // Conversations
  // -----------------------------------------

  const setConversations =
    useCallback(
      (
        nextConversations:
          Conversation[]
      ) => {

        conversationsRef.current =
          nextConversations;


        // Synchronize the browser fallback
        // with values returned by the backend.

        const nextSelectedMap = {
          ...selectedDocumentMapRef.current,
        };


        for (
          const conversation
          of nextConversations
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
          nextSelectedMap
        );


        setConversationsState(
          nextConversations
        );


        // If a conversation is already active,
        // restore its persisted research paper.

        const activeId =
          activeConversationIdRef.current;


        if (!activeId) {
          return;
        }


        const activeConversation =
          nextConversations.find(
            (conversation) =>
              conversation.id ===
              activeId
          );


        if (!activeConversation) {
          return;
        }


        const restoredDocumentId =
          activeConversation
            .selectedDocumentId
            ?? null;


        setSelectedDocumentIdState(
          restoredDocumentId
        );

      },
      []
    );


  // -----------------------------------------
  // Add Conversation
  // -----------------------------------------

  const addConversation =
    useCallback(
      (
        conversation: Conversation
      ) => {

        conversationsRef.current = [
          conversation,
          ...conversationsRef.current,
        ];


        setConversationsState(
          conversationsRef.current
        );

      },
      []
    );


  // -----------------------------------------
  // Remove Conversation
  // -----------------------------------------

  const removeConversation =
    useCallback(
      (
        id: string
      ) => {

        conversationsRef.current =
          conversationsRef.current.filter(
            (conversation) =>
              conversation.id !== id
          );


        setConversationsState(
          conversationsRef.current
        );


        const nextMap = {
          ...selectedDocumentMapRef.current,
        };


        delete nextMap[id];


        selectedDocumentMapRef.current =
          nextMap;


        saveSelectedDocumentMap(
          nextMap
        );


        if (
          activeConversationIdRef.current ===
          id
        ) {

          activeConversationIdRef.current =
            null;

          setActiveConversationId(
            null
          );

          setSelectedDocumentIdState(
            null
          );

        }

      },
      []
    );


  // -----------------------------------------
  // Update Conversation
  // -----------------------------------------

  const updateConversation =
    useCallback(
      (
        updatedConversation:
          Conversation
      ) => {

        conversationsRef.current =
          conversationsRef.current.map(
            (conversation) =>
              conversation.id ===
              updatedConversation.id
                ? {
                    ...conversation,
                    ...updatedConversation,
                  }
                : conversation
          );


        setConversationsState(
          conversationsRef.current
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
            restored
          );


          selectedDocumentMapRef.current = {
            ...selectedDocumentMapRef.current,
            [updatedConversation.id]:
              restored,
          };


          saveSelectedDocumentMap(
            selectedDocumentMapRef.current
          );

        }

      },
      []
    );


  // -----------------------------------------
  // Sidebar
  // -----------------------------------------

  const toggleSidebar =
    useCallback(
      () => {

        setSidebarOpen(
          (prev) =>
            !prev
        );

      },
      []
    );


  // -----------------------------------------
  // Add Document
  // -----------------------------------------

  const addDocument =
    useCallback(
      (
        doc: Document
      ) => {

        setDocumentsState(
          (prev) => [
            doc,
            ...prev,
          ]
        );

      },
      []
    );


  // -----------------------------------------
  // Remove Document
  // -----------------------------------------

  const removeDocument =
    useCallback(
      (
        id: string
      ) => {

        setDocumentsState(
          (prev) =>
            prev.filter(
              (doc) =>
                doc.id !== id
            )
        );

      },
      []
    );


  // -----------------------------------------
  // Update Document
  // -----------------------------------------

  const updateDocument =
    useCallback(
      (
        id: string,
        updates: Partial<Document>
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
                  : doc
            )
        );

      },
      []
    );


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


        toggleSidebar,


        addDocument,

        removeDocument,

        updateDocument,

      }}
    >

      {children}

    </WorkspaceContext.Provider>

  );

}


export function useWorkspaceStore():
  WorkspaceStore {

  const context =
    useContext(
      WorkspaceContext
    );


  if (!context) {

    throw new Error(
      "useWorkspaceStore must be used within WorkspaceProvider"
    );

  }


  return context;
}