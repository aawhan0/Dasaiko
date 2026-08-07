import type {
  ChatMessage,
  EvidenceChunk,
} from "@/types";

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

    // Research paper title
    documentName: source.paper_title,

    // Human-readable chunk number
    chunkIndex: source.chunk_number,

    // Confidence (0-100)
    score: source.confidence,

    // Preview from backend
    preview: source.preview,

    // Future use (PDF page highlighting)
    page: undefined,
  }));
}