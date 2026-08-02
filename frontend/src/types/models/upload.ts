export interface UploadFile {
  id: string;
  file: File;

  progress: number;

  status:
    | "uploading"
    | "processing"
    | "ready"
    | "error";

  errorMessage?: string;
}