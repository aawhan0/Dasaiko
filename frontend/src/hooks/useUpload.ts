import { useState, useCallback, useEffect, useRef } from "react";

import type { UploadFile } from "@/types";

import { isAcceptedFile } from "@/utils/fileHelpers";

import { useUploadStore } from "@/store/useUploadStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

import { uploadDocument } from "@/services/documents";

export function useUpload() {
  const {
    addFiles,
    updateProgress,
    setStatus,
    queue,
  } = useUploadStore();

  const { addDocument } = useWorkspaceStore();

  const [isDragOver, setIsDragOver] =
    useState(false);

  const processingRef =
    useRef<Set<string>>(new Set());

  useEffect(() => {
    const uploading = queue.filter(
      (file) =>
        file.status === "uploading" &&
        !processingRef.current.has(file.id)
    );

    uploading.forEach((upload) => {
      processingRef.current.add(upload.id);

      simulateUpload(
        upload,
        updateProgress,
        setStatus,
        addDocument
      ).finally(() => {
        processingRef.current.delete(upload.id);
      });
    });
  }, [
    queue,
    updateProgress,
    setStatus,
    addDocument,
  ]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter(
        isAcceptedFile
      );

      if (valid.length > 0) {
        addFiles(valid);
      }
    },
    [addFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      setIsDragOver(false);

      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      setIsDragOver(true);
    },
    []
  );

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onFileInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return {
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileInputChange,
    queue,
  };
}

async function simulateUpload(
  upload: UploadFile,
  updateProgress: (
    id: string,
    progress: number
  ) => void,
  setStatus: (
    id: string,
    status: UploadFile["status"],
    error?: string
  ) => void,
  addDocument: (
    doc: ReturnType<typeof uploadDocument> extends Promise<infer T>
      ? T
      : never
  ) => void
) {
  try {
    console.log("========== START UPLOAD ==========");
    console.log(upload);

    for (let p = 10; p <= 90; p += 10) {
      await delay(150);
      updateProgress(upload.id, p);
    }

    console.log("Calling backend...");

    const doc = await uploadDocument(upload.file);

    console.log("Backend returned:");
    console.log(doc);

    updateProgress(upload.id, 100);

    console.log("Calling addDocument()");

    addDocument(doc);

    console.log("addDocument() completed");

    await delay(500);

    setStatus(upload.id, "ready");

    console.log("Upload finished.");
    console.log("========== END UPLOAD ==========");
  } catch (error) {
    console.error("UPLOAD FAILED");
    console.error(error);

    setStatus(
      upload.id,
      "error",
      "Upload failed. Please try again."
    );
  }
}

function delay(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}