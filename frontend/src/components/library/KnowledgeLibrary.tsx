import { useState } from "react";
import { Loader2 } from "lucide-react";

import { DocumentCard } from "./DocumentCard";
import { DocumentMenu } from "./DocumentMenu";
import { SearchBar } from "./SearchBar";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { deleteDocument } from "@/services/documents";

import type { Document } from "@/types";

export function KnowledgeLibrary() {
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
    setDocuments,
    selectedPdf,
    selectedEvidence,
    setSelectedPdf,
    setSelectedEvidence,
  } = useWorkspaceStore();

  const [query, setQuery] =
    useState("");

  const [
    documentToDelete,
    setDocumentToDelete,
  ] = useState<Document | null>(null);

  const [
    documentMenu,
    setDocumentMenu,
  ] = useState<{
    document: Document;
    x: number;
    y: number;
  } | null>(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(null);

  const filteredDocuments =
    documents.filter((doc) =>
      (doc.name ?? "")
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  const handleDeleteDocument =
    async () => {
      if (
        !documentToDelete ||
        isDeleting
      ) {
        return;
      }

      const documentsBeforeDeletion =
        documents;

      const deletedDocument =
        documentToDelete;

      setIsDeleting(true);
      setDeleteError(null);

      /*
       * Optimistically remove the
       * document from the library.
       */
      setDocuments(
        documents.filter(
          (document) =>
            document.id !==
            deletedDocument.id,
        ),
      );

      const clearsSelection =
        activeDocumentId ===
          deletedDocument.id ||
        selectedEvidence?.documentId ===
          deletedDocument.id ||
        selectedPdf ===
          deletedDocument.filePath;

      if (clearsSelection) {
        setActiveDocument(null);
        setSelectedEvidence(null);
        setSelectedPdf(null);
      }

      try {
        await deleteDocument(
          deletedDocument.id,
        );

        setDocumentToDelete(null);
      } catch (error) {
        console.error(
          "Document deletion failed:",
          error,
        );

        /*
         * Restore previous state if
         * deletion fails.
         */
        setDocuments(
          documentsBeforeDeletion,
        );

        if (clearsSelection) {
          setActiveDocument(
            activeDocumentId,
          );

          setSelectedEvidence(
            selectedEvidence,
          );

          setSelectedPdf(
            selectedPdf,
          );
        }

        setDeleteError(
          "Could not delete the document. Please try again.",
        );
      } finally {
        setIsDeleting(false);
      }
    };

  return (
    <div
      className="
        flex
        h-full
        flex-col
        gap-2
      "
      onClick={() => {
        if (documentMenu) {
          setDocumentMenu(null);
        }
      }}
    >
      {/* Error */}

      {deleteError && (
        <p
          role="alert"
          className="
            px-2.5
            text-[10px]
            text-red-400
          "
        >
          {deleteError}
        </p>
      )}

      {/* Document list */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Section label */}

        <div className="px-2.5 pb-1.5">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-zinc-600
            "
          >
            Documents
          </p>
        </div>

        {/* Empty state */}

        {filteredDocuments.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-zinc-600">
              No documents found.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredDocuments.map(
              (doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isActive={
                    activeDocumentId ===
                    doc.id
                  }
                  onClick={() =>
                    setActiveDocument(
                      doc.id,
                    )
                  }
                  onContextMenu={(
                    x,
                    y,
                  ) => {
                    setDocumentMenu({
                      document: doc,
                      x,
                      y,
                    });
                  }}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* Context menu */}

      {documentMenu && (
        <DocumentMenu
          x={documentMenu.x}
          y={documentMenu.y}
          onDelete={() => {
            setDeleteError(null);

            setDocumentToDelete(
              documentMenu.document,
            );

            setDocumentMenu(null);
          }}
        />
      )}

      {/* Delete confirmation */}

      {documentToDelete && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            className="
              w-full
              max-w-sm
              rounded-xl
              border
              border-white/[0.10]
              bg-[#111111]
              p-5
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h2
              id="delete-document-title"
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Delete document?
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-5
                text-zinc-400
              "
            >
              This permanently deletes{" "}
              <span className="text-zinc-200">
                {documentToDelete.name}
              </span>
              , its chunks, embeddings,
              and uploaded PDF.
            </p>

            <div
              className="
                mt-5
                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  setDocumentToDelete(
                    null,
                  )
                }
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-zinc-400
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={
                  handleDeleteDocument
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-red-500
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-red-400
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isDeleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}