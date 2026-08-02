/**
 * Collections Service
 *
 * Collections are not implemented in the current FastAPI backend.
 * This service exists only to satisfy existing imports.
 *
 * TODO:
 * Remove this file once the frontend no longer references collections,
 * or implement real backend endpoints.
 */

export interface Collection {
  id: string;
  name: string;
  color: string;
  documentCount: number;
  createdAt: string;
}

export async function listCollections(): Promise<Collection[]> {
  return [];
}

export async function createCollection(
  name: string,
  color: string
): Promise<Collection> {
  throw new Error(
    "Collections are not implemented in the backend."
  );
}

export async function deleteCollection(
  id: string
): Promise<void> {
  throw new Error(
    "Collections are not implemented in the backend."
  );
}