export interface Conversation {
  id: string;
  title: string;
  documentIds: string[];
  messageCount: number;
  lastActivityAt: string;
  isPinned?: boolean;
}