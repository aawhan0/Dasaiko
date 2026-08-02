export interface EvidenceChunk {
  id: string;

  documentName: string;

  chunkIndex: number;

  score: number;

  preview: string;

  page?: number;
}