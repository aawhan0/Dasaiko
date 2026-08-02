export interface ChatRequest {
  conversation_id: number;
  query: string;
}

export interface SourceResponse {
  document: string;
  chunk_index: number;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceResponse[];
}