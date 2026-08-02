import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UploadFile } from '@/types';
import { generateId } from '@/utils/fileHelpers';

interface UploadStore {
  queue: UploadFile[];
  addFiles: (files: File[]) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadFile['status'], error?: string) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
}

const UploadContext = createContext<UploadStore | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<UploadFile[]>([]);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadFile[] = files.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'uploading',
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setQueue((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress } : f))
    );
  }, []);

  const setStatus = useCallback((id: string, status: UploadFile['status'], errorMessage?: string) => {
    setQueue((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, errorMessage } : f))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((f) => f.status !== 'ready' && f.status !== 'error'));
  }, []);

  return (
    <UploadContext.Provider value={{ queue, addFiles, updateProgress, setStatus, removeFile, clearCompleted }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadStore(): UploadStore {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUploadStore must be used within UploadProvider');
  return ctx;
}
