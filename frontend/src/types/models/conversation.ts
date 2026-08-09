export interface Conversation {
  id: string;
  title: string;
  isPinned?: boolean;
  documentIds: string[];
  messageCount: number;
  lastActivityAt: string;

  // Paper used as the default research context
  // for paper-dependent questions in this conversation.
  selectedDocumentId: number | null;
}
