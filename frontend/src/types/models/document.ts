export type DocumentStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "error";

export interface Document {
  id: string;

  name: string;

  title: string;

  fileName: string;

  filePath: string;

  type: "pdf" | "docx" | "txt" | "md";

  size: number;

  pageCount: number;

  status: DocumentStatus;

  collectionId?: string;

  uploadedAt: string;

  summary?: string;

  chunkCount?: number;
}