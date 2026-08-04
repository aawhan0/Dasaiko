export interface Conversation {
  id: string;
  title: string;
  isPinned?: boolean;
  documentIds: string[];
  messageCount: number;
  lastActivityAt: string;
}