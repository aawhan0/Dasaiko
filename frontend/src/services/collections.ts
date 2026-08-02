import type { Collection } from '@/types';
import { mockCollections } from '@/data/mockData';
// import api from './api';

export async function listCollections(): Promise<Collection[]> {
  // return (await api.get('/collections')).data;
  await delay(200);
  return mockCollections;
}

export async function createCollection(name: string, color: Collection['color']): Promise<Collection> {
  // return (await api.post('/collections', { name, color })).data;
  await delay(300);
  return {
    id: `col-${Date.now()}`,
    name,
    color,
    documentCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteCollection(id: string): Promise<void> {
  // await api.delete(`/collections/${id}`);
  await delay(200);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
