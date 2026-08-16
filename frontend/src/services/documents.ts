/**
 * Documents Service
 * Connects the React frontend to the FastAPI backend.
 */

import api from "./api";

import type {
  Document,
  DocumentResponse,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UploadDocumentOptions {
  onUploadProgress?: (
    progress: number,
  ) => void;
  onProcessing?: () => void;
}

/**
 * Convert the backend document response
 * into the frontend document model.
 */
function mapDocument(
  doc: DocumentResponse,
  fileSize = 0,
): Document {
  return {
    id: String(doc.id),

    title: doc.title,

    name: doc.title,

    fileName:
      doc.file_name ?? "",

    filePath:
      doc.file_path ?? "",

    type: "pdf",

    size: fileSize,

    pageCount: 0,

    status: "ready",

    uploadedAt:
      doc.created_at,

    chunkCount: 0,
  };
}

/**
 * GET /documents
 */
export async function listDocuments(): Promise<
  Document[]
> {
  const response =
    await api.get<
      ApiResponse<DocumentResponse[]>
    >("/documents");

  return response.data.data.map(
    (doc) =>
      mapDocument(doc),
  );
}

/**
 * GET /documents/{id}
 */
export async function getDocument(
  id: string,
): Promise<Document> {
  const response =
    await api.get<
      ApiResponse<DocumentResponse>
    >(`/documents/${id}`);

  return mapDocument(
    response.data.data,
  );
}

/**
 * POST /documents/upload
 *
 * Upload progress represents the actual
 * network transfer to the backend.
 *
 * Once upload reaches 100%, the backend
 * may still be extracting/chunking/
 * embedding the document.
 */
export async function uploadDocument(
  file: File,
  options?: UploadDocumentOptions,
): Promise<Document> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await api.post<
      ApiResponse<DocumentResponse>
    >(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },

        onUploadProgress:
          (progressEvent) => {
            if (
              !progressEvent.total
            ) {
              return;
            }

            const progress =
              Math.round(
                (
                  progressEvent.loaded /
                  progressEvent.total
                ) * 100,
              );

            options?.onUploadProgress?.(
              Math.min(
                progress,
                100,
              ),
            );
          },
      },
    );

  /*
   * The request has completed.
   *
   * That means the backend has finished
   * processing the document too, because
   * the current endpoint is synchronous.
   */
  options?.onProcessing?.();

  return mapDocument(
    response.data.data,
    file.size,
  );
}

/**
 * DELETE /documents/{id}
 */
export async function deleteDocument(
  id: string,
): Promise<void> {
  await api.delete(
    `/documents/${id}`,
  );
}