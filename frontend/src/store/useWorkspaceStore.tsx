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

import {
  mockMessages,
  mockDocuments,
  mockThreads,
} from "@/data/mockData";

interface WorkspaceState {
  activeConversationId: string | null;

  activeDocumentId: string | null;

  messages: ChatMessage[];

  documents: Document[];

  conversations: Conversation[];

  activeEvidence: EvidenceChunk[];

  isQuerying: boolean;

  sidebarOpen: boolean;
}

interface WorkspaceActions {
  setActiveConversation: (id: string | null) => void;

  setActiveDocument: (id: string | null) => void;

  addMessage: (msg: ChatMessage) => void;

  setMessages: (
    updater:
      | ChatMessage[]
      | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;

  setActiveEvidence: (ev: EvidenceChunk[]) => void;

  setIsQuerying: (v: boolean) => void;

  toggleSidebar: () => void;

  addDocument: (doc: Document) => void;

  updateDocument: (
    id: string,
    updates: Partial<Document>
  ) => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

const WorkspaceContext =
  createContext<WorkspaceStore | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>("conversation-1");

  const [activeDocumentId, setActiveDocumentId] =
    useState<string | null>(null);

  const [messages, setMessagesState] =
    useState<ChatMessage[]>(mockMessages);

  const [documents, setDocuments] =
    useState<Document[]>(mockDocuments);

  const [conversations] =
    useState<Conversation[]>(mockThreads);

  const [activeEvidence, setActiveEvidence] =
    useState<EvidenceChunk[]>(
      mockMessages[1]?.evidence ?? []
    );

  const [isQuerying, setIsQuerying] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const setActiveConversation = useCallback(
    (id: string | null) => {
      setActiveConversationId(id);
    },
    []
  );

  const setActiveDocument = useCallback(
    (id: string | null) => {
      setActiveDocumentId(id);
    },
    []
  );

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessagesState((prev) => [...prev, msg]);
  }, []);

  const setMessages = useCallback(
    (
      updater:
        | ChatMessage[]
        | ((prev: ChatMessage[]) => ChatMessage[])
    ) => {
      if (typeof updater === "function") {
        setMessagesState(updater);
      } else {
        setMessagesState(updater);
      }
    },
    []
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  const updateDocument = useCallback(
    (
      id: string,
      updates: Partial<Document>
    ) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, ...updates }
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

        messages,
        documents,
        conversations,

        activeEvidence,

        isQuerying,

        sidebarOpen,

        setActiveConversation,

        setActiveDocument,

        addMessage,

        setMessages,

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
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspaceStore must be used within WorkspaceProvider"
    );
  }

  return context;
}