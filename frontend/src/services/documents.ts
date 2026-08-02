/**
 * Documents Service
 * All functions currently return mock data.
 * Swap mock returns for api.* calls to connect to FastAPI.
 */
import type { Document, PaginatedResponse } from '@/types';
import { mockDocuments } from '@/data/mockData';
// import api from './api'; // Uncomment when connecting to backend

export async function listDocuments(page = 1, pageSize = 20): Promise<PaginatedResponse<Document>> {
  // return (await api.get(`/documents?page=${page}&page_size=${pageSize}`)).data;
  await delay(300);
  return {
    items: mockDocuments,
    total: mockDocuments.length,
    page,
    pageSize,
  };
}

export async function getDocument(id: string): Promise<Document> {
  // return (await api.get(`/documents/${id}`)).data;
  await delay(200);
  const doc = mockDocuments.find((d) => d.id === id);
  if (!doc) throw new Error(`Document ${id} not found`);
  return doc;
}

export async function uploadDocument(file: File, collectionId?: string): Promise<Document> {
  // const form = new FormData();
  // form.append('file', file);
  // if (collectionId) form.append('collection_id', collectionId);
  // return (await api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  await delay(1500);
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    name: file.name,
    type: 'pdf',
    size: file.size,
    pageCount: 0,
    status: 'processing',
    collectionId,
    uploadedAt: new Date().toISOString(),
    chunkCount: 0,
  };
  return newDoc;
}

export async function deleteDocument(id: string): Promise<void> {
  // await api.delete(`/documents/${id}`);
  await delay(300);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
