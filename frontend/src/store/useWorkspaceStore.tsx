import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import type {
  ChatMessage,
  Conversation,
  Document,
  EvidenceChunk,
} from "@/types";

interface WorkspaceState {
  activeConversationId: string | null;

  activeDocumentId: string | null;

  selectedPdf: string | null;

  messages: ChatMessage[];

  documents: Document[];

  conversations: Conversation[];

  activeEvidence: EvidenceChunk[];

  isQuerying: boolean;

  sidebarOpen: boolean;
}

interface WorkspaceActions {
  setActiveConversation: (
    id: string | null
  ) => void;

  setActiveDocument: (
    id: string | null
  ) => void;

  setSelectedPdf: (
    path: string | null
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

  const [
    activeDocumentId,
    setActiveDocumentId,
  ] = useState<string | null>(
    null
  );

  const [
    selectedPdf,
    setSelectedPdfState,
  ] = useState<string | null>(
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
  ] = useState<
    Conversation[]
  >([]);

  const [
    activeEvidence,
    setActiveEvidence,
  ] = useState<
    EvidenceChunk[]
  >([]);

  const [
    isQuerying,
    setIsQuerying,
  ] = useState(false);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const setActiveConversation =
    useCallback(
      (id: string | null) => {
        setActiveConversationId(
          id
        );
      },
      []
    );

  const setActiveDocument =
    useCallback(
      (id: string | null) => {
        setActiveDocumentId(id);
      },
      []
    );

  const setSelectedPdf =
    useCallback(
      (path: string | null) => {
        setSelectedPdfState(path);
      },
      []
    );

  const addMessage =
    useCallback(
      (msg: ChatMessage) => {
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

  const setDocuments =
    useCallback(
      (
        documents: Document[]
      ) => {
        setDocumentsState(
          documents
        );
      },
      []
    );

  const setConversations =
    useCallback(
      (
        conversations: Conversation[]
      ) => {
        setConversationsState(
          conversations
        );
      },
      []
    );

  const addConversation =
    useCallback(
      (
        conversation: Conversation
      ) => {
        setConversationsState(
          (prev) => [
            conversation,
            ...prev,
          ]
        );
      },
      []
    );

  const removeConversation =
    useCallback(
      (id: string) => {
        setConversationsState(
          (prev) =>
            prev.filter(
              (
                conversation
              ) =>
                conversation.id !==
                id
            )
        );
      },
      []
    );

  const updateConversation =
    useCallback(
      (
        updatedConversation: Conversation
      ) => {
        setConversationsState(
          (prev) =>
            prev.map(
              (
                conversation
              ) =>
                conversation.id ===
                updatedConversation.id
                  ? {
                      ...conversation,
                      ...updatedConversation,
                    }
                  : conversation
            )
        );
      },
      []
    );

  const toggleSidebar =
    useCallback(() => {
      setSidebarOpen(
        (prev) => !prev
      );
    }, []);

  const addDocument =
    useCallback(
      (doc: Document) => {
        setDocumentsState(
          (prev) => [
            doc,
            ...prev,
          ]
        );
      },
      []
    );

  const updateDocument =
    useCallback(
      (
        id: string,
        updates: Partial<Document>
      ) => {
        setDocumentsState(
          (prev) =>
            prev.map((doc) =>
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
        selectedPdf,

        messages,
        documents,
        conversations,

        activeEvidence,

        isQuerying,
        sidebarOpen,

        setActiveConversation,
        setActiveDocument,
        setSelectedPdf,

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
        updateDocument,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceStore(): WorkspaceStore {
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