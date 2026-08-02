import type { ChatMessage, EvidenceChunk } from "@/types";

import type {
  ChatResponse,
  SourceResponse,
} from "@/types/api/chat";

/**
 * Convert FastAPI ChatResponse -> UI ChatMessage
 */
export function mapChatResponse(
  response: ChatResponse
): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: response.answer,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert FastAPI SourceResponse[] -> UI EvidenceChunk[]
 */
export function mapSources(
  sources: SourceResponse[]
): EvidenceChunk[] {
  return sources.map((source, index) => ({
    id: `${index}`,
    documentName: source.document,
    chunkIndex: source.chunk_index,
    score: source.score,
    preview: "",
    page: undefined,
  }));
}