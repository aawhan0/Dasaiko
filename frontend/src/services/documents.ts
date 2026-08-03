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

/**
 * GET /documents
 */
export async function listDocuments(): Promise<Document[]> {
  const response =
    await api.get<ApiResponse<DocumentResponse[]>>(
      "/documents"
    );

  return response.data.data.map((doc) => ({
    id: String(doc.id),

    name: doc.file_name ?? doc.title,

    type: "pdf",

    size: 0,

    pageCount: 0,

    status: "ready",

    uploadedAt: doc.created_at,

    chunkCount: 0,
  }));
}

/**
 * GET /documents/{id}
 */
export async function getDocument(
  id: string
): Promise<Document> {
  const response =
    await api.get<ApiResponse<DocumentResponse>>(
      `/documents/${id}`
    );

  const doc = response.data.data;

  return {
    id: String(doc.id),

    name: doc.file_name ?? doc.title,

    type: "pdf",

    size: 0,

    pageCount: 0,

    status: "ready",

    uploadedAt: doc.created_at,

    chunkCount: 0,
  };
}

/**
 * POST /documents/upload
 */
export async function uploadDocument(
  file: File
): Promise<Document> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<ApiResponse<DocumentResponse>>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  console.log(
    "UPLOAD RESPONSE",
    response.data
  );

  const doc = response.data.data;

  return {
    id: String(doc.id),

    name: doc.file_name ?? doc.title,

    type: "pdf",

    size: file.size,

    pageCount: 0,

    status: "ready",

    uploadedAt: doc.created_at,

    chunkCount: 0,
  };
}

/**
 * DELETE /documents/{id}
 */
export async function deleteDocument(
  id: string
): Promise<void> {
  await api.delete(`/documents/${id}`);
}