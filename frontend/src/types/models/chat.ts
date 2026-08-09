import type { EvidenceChunk } from "./evidence";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  evidence?: EvidenceChunk[];
  paperSelection?: PaperSelection;
  isStreaming?: boolean;
}

export interface PaperSelection {
  required: boolean;

  documents: {
    id: number;
    title: string;
  }[];
}