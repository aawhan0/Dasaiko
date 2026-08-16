import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

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

  const {
    addDocument,
    setSelectedDocumentId,
    sidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  const [isDragOver, setIsDragOver] =
    useState(false);

  const processingRef =
    useRef<Set<string>>(new Set());


  useEffect(() => {
    const uploading = queue.filter(
      (file) =>
        file.status === "uploading" &&
        !processingRef.current.has(file.id),
    );

    uploading.forEach((upload) => {
      processingRef.current.add(upload.id);

      processUpload({
        upload,
        updateProgress,
        setStatus,
        addDocument,
        setSelectedDocumentId,
        sidebarOpen,
        toggleSidebar,
      }).finally(() => {
        processingRef.current.delete(upload.id);
      });
    });
  }, [
    queue,
    updateProgress,
    setStatus,
    addDocument,
    setSelectedDocumentId,
    sidebarOpen,
    toggleSidebar,
  ]);


  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(
        isAcceptedFile,
      );

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    },
    [addFiles],
  );


  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      setIsDragOver(false);

      handleFiles(
        event.dataTransfer.files,
      );
    },
    [handleFiles],
  );


  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      setIsDragOver(true);
    },
    [],
  );


  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);


  const onFileInputChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (event.target.files) {
        handleFiles(event.target.files);
      }

      /*
       * Allow the same file to be selected again.
       */
      event.target.value = "";
    },
    [handleFiles],
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


/* =========================================================
   UPLOAD PROCESS
========================================================= */

interface ProcessUploadParams {
  upload: UploadFile;

  updateProgress: (
    id: string,
    progress: number,
  ) => void;

  setStatus: (
    id: string,
    status: UploadFile["status"],
    error?: string,
  ) => void;

  addDocument: (
    doc: Awaited<
      ReturnType<typeof uploadDocument>
    >,
  ) => void;

  setSelectedDocumentId: (
    id: number | null,
  ) => void;

  sidebarOpen: boolean;

  toggleSidebar: () => void;
}


async function processUpload({
  upload,
  updateProgress,
  setStatus,
  addDocument,
  setSelectedDocumentId,
  sidebarOpen,
  toggleSidebar,
}: ProcessUploadParams) {
  try {
    /*
     * Upload has started.
     */
    updateProgress(
      upload.id,
      0,
    );


    /*
     * Send the document to the backend.
     */
    const document =
      await uploadDocument(
        upload.file,
      );


    /*
     * Backend has accepted and processed
     * the document.
     */
    setStatus(
      upload.id,
      "processing",
    );

    updateProgress(
      upload.id,
      100,
    );


    /*
     * Add the document to the workspace.
     */
    addDocument(
      document,
    );


    /*
     * Select the document so the sidebar
     * immediately reflects what was uploaded.
     */
    const documentId =
      Number(document.id);

    if (
      Number.isFinite(documentId)
    ) {
      setSelectedDocumentId(
        documentId,
      );
    }


    /*
     * Open the sidebar automatically
     * after the upload succeeds.
     */
    if (!sidebarOpen) {
      toggleSidebar();
    }


    /*
     * Upload is completely finished.
     */
    setStatus(
      upload.id,
      "ready",
    );

  } catch (error) {
    console.error(
      "Document upload failed:",
      error,
    );

    setStatus(
      upload.id,
      "error",
      getUploadErrorMessage(error),
    );
  }
}


/* =========================================================
   ERROR HANDLING
========================================================= */

function getUploadErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "string" &&
    error.length > 0
  ) {
    return error;
  }

  return "Upload failed. Please try again.";
}