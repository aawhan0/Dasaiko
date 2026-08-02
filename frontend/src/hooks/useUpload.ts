import { useState, useCallback, useEffect, useRef } from 'react';
import type { UploadFile } from '@/types';
import { isAcceptedFile, generateId } from '@/utils/fileHelpers';
import { useUploadStore } from '@/store/useUploadStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { uploadDocument } from '@/services/documents';

export function useUpload() {
  const { addFiles, updateProgress, setStatus, queue } = useUploadStore();
  const { addDocument } = useWorkspaceStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const processingRef = useRef<Set<string>>(new Set());

  // Simulate upload progress for any file in 'uploading' state
  useEffect(() => {
    const uploading = queue.filter(
      (f) => f.status === 'uploading' && !processingRef.current.has(f.id),
    );

    uploading.forEach((upload) => {
      processingRef.current.add(upload.id);
      simulateUpload(upload, updateProgress, setStatus, addDocument).finally(() => {
        processingRef.current.delete(upload.id);
      });
    });
  }, [queue, updateProgress, setStatus, addDocument]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter(isAcceptedFile);
      if (valid.length > 0) addFiles(valid);
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles],
  );

  return { isDragOver, onDrop, onDragOver, onDragLeave, onFileInputChange, queue };
}

// Simulated upload flow (replace with real axios progress in service layer)
async function simulateUpload(
  upload: UploadFile,
  updateProgress: (id: string, p: number) => void,
  setStatus: (id: string, s: UploadFile['status'], e?: string) => void,
  addDocument: ReturnType<typeof useWorkspaceStore>['addDocument'],
) {
  try {
    // Simulate progress
    for (let p = 10; p <= 90; p += 10) {
      await delay(150);
      updateProgress(upload.id, p);
    }
    const doc = await uploadDocument(upload.file);
    updateProgress(upload.id, 100);
    addDocument(doc);
    await delay(500);
    setStatus(upload.id, 'ready');
  } catch {
    setStatus(upload.id, 'error', 'Upload failed. Please try again.');
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
