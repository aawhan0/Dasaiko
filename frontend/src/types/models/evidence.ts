export interface EvidenceChunk {
  id: string;

  documentId: string;

  documentName: string;

  chunkIndex: number;

  pageNumber: number;

  bboxes: number[][];

  score: number;

  preview: string;
}