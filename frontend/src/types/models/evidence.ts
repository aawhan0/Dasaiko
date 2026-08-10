export interface EvidenceChunk {
  id: string;

  documentId: string;

  documentName: string;

  chunkIndex: number;

  pageNumber: number;

  pageWidth: number | null;

  pageHeight: number | null;

  bboxes: number[][];

  score: number;

  preview: string;
}
