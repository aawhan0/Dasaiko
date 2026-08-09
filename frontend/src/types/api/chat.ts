export interface ChatRequest {
  conversation_id: number;
  query: string;
  selected_document_id?: number | null;
  selection_continuation?: boolean;
}


export interface SourceResponse {
  id: number;
  document_id: number;
  document_name: string;
  chunk_index: number;
  page_number: number;
  page_width?: number | null;
  page_height?: number | null;
  bboxes: number[][];
  confidence: number;
  preview: string;
}


export interface PaperOptionResponse {
  id: number;
  title: string;
}


export interface PaperSelectionResponse {
  required: boolean;
  documents: PaperOptionResponse[];
}


export interface ChatResponse {
  answer: string;
  sources: SourceResponse[];
  paper_selection?: PaperSelectionResponse | null;
}
