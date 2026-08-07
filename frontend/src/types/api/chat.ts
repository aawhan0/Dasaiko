export interface ChatRequest {
  conversation_id: number;
  query: string;
}

export interface SourceResponse {
  id: number;

  document_id: number;

  document_name: string;

  chunk_index: number;

  page_number: number;

  bboxes: number[][];

  confidence: number;

  preview: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceResponse[];
}