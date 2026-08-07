export interface EvidenceChunk {
  id: string;

  documentId: string;

  documentName: string;

  chunkIndex: number;

  pageNumber: number;

  startChar: number;

  endChar: number;

  score: number;

  preview: string;
}