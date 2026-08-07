import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { fadeIn } from "@/utils/animations";

import { DocumentCard } from "./DocumentCard";
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

  const [query, setQuery] = useState("");
  const [documentToDelete, setDocumentToDelete] =
    useState<Document | null>(null);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [deleteError, setDeleteError] = useState<
    string | null
  >(null);

  console.log(documents);


  console.log("DOCUMENTS:");
  console.table(documents);

  const filteredDocuments = documents.filter((doc) =>
    (doc.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const handleDeleteDocument = async () => {
    if (!documentToDelete || isDeleting) return;

    const documentsBeforeDeletion = documents;
    const deletedDocument = documentToDelete;

    setIsDeleting(true);
    setDeleteError(null);
    setDocuments(
      documents.filter(
        (document) => document.id !== deletedDocument.id
      )
    );

    const clearsSelection =
      activeDocumentId === deletedDocument.id ||
      selectedEvidence?.documentId === deletedDocument.id ||
      selectedPdf === deletedDocument.filePath;

    if (clearsSelection) {
      setActiveDocument(null);
      setSelectedEvidence(null);
      setSelectedPdf(null);
    }

    try {
      await deleteDocument(deletedDocument.id);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Document deletion failed:", error);
      setDocuments(documentsBeforeDeletion);

      if (clearsSelection) {
        setActiveDocument(activeDocumentId);
        setSelectedEvidence(selectedEvidence);
        setSelectedPdf(selectedPdf);
      }

      setDeleteError(
        "Could not delete the document. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-4"
    >
      <SearchBar
        onSearch={setQuery}
      />

      {deleteError && (
        <p
          role="alert"
          className="px-3 text-xs text-red-400"
        >
          {deleteError}
        </p>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-3 pb-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Documents
          </p>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-zinc-600">
              No documents found.
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isActive={activeDocumentId === doc.id}
              onClick={() => setActiveDocument(doc.id)}
              onDelete={() => {
                setDeleteError(null);
                setDocumentToDelete(doc);
              }}
              isDeleting={isDeleting && documentToDelete?.id === doc.id}
            />
          ))
        )}
      </div>

      {documentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            className="w-full max-w-sm rounded-xl border border-white/[0.10] bg-[#111111] p-5 shadow-2xl"
          >
            <h2
              id="delete-document-title"
              className="text-sm font-semibold text-white"
            >
              Delete document?
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              This permanently deletes
              {" "}
              <span className="text-zinc-200">
                {documentToDelete.name}
              </span>
              , its chunks, embeddings, and uploaded PDF.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDocumentToDelete(null)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteDocument}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
