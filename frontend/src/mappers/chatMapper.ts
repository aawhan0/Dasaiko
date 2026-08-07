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
  return sources.map((source) => ({
    id: String(source.id),

    documentId: String(source.document_id),

    documentName: source.document_name,

    chunkIndex: source.chunk_index + 1,

    pageNumber: source.page_number,

    pageWidth: source.page_width ?? null,

    pageHeight: source.page_height ?? null,

    bboxes: source.bboxes,

    score: source.confidence,

    preview: source.preview,
  }));
}
