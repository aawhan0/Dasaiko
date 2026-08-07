export interface ChatRequest {
  conversation_id: number;
  query: string;
}

export interface SourceResponse {
  paper_title: string;
  chunk_number: number;
  confidence: number;
  preview: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceResponse[];
}