export interface DocumentResponse {
  id: number;
  title: string;
  source: string;
  file_name?: string;
}

export interface UploadDocumentResponse {
  id: number;
  title: string;
  source: string;
}