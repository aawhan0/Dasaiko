import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

import { fadeIn } from "@/utils/animations";

import { DocumentCard } from "./DocumentCard";
import { SearchBar } from "./SearchBar";
import { DocumentMenu } from "./DocumentMenu";


import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { deleteDocument } from "@/services/documents";

import type { Document } from "@/types";


export function KnowledgeLibrary() {
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
    removeDocument,
  } = useWorkspaceStore();

  const [query, setQuery] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<Document | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuX, setMenuX] =
    useState(0);

  const [menuY, setMenuY] =
    useState(0);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const filteredDocuments = documents.filter((doc) =>
    (doc.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async () => {
  if (!selectedDocument) return;

  try {
    setIsDeleting(true);

    await deleteDocument(selectedDocument.id);

    removeDocument(selectedDocument.id);

    if (activeDocumentId === selectedDocument.id) {
      setActiveDocument(null);
    }

    setDeleteOpen(false);
    setSelectedDocument(null);
  } catch (error) {
    console.error(error);
    alert("Failed to delete document.");
  } finally {
    setIsDeleting(false);
  }
};

useEffect(() => {
  function handleClick(
    event: MouseEvent
  ) {
    if (
      menuRef.current &&
      !menuRef.current.contains(
        event.target as Node
      )
    ) {
      setMenuOpen(false);
    }
  }

  if (menuOpen) {
    document.addEventListener(
      "mousedown",
      handleClick
    );
  }

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClick
    );
  };
}, [menuOpen]);

  return (
      <>
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-4"
    >
      <SearchBar
        onSearch={setQuery}
      />

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
              onContextMenu={(x, y) => {
                setSelectedDocument(doc);

                setMenuX(x);
                setMenuY(y);

                setMenuOpen(true);
              }}
            />
          ))
        )}
      </div>
    </motion.div>
    
    {menuOpen && selectedDocument && (
  <div ref={menuRef}>
    <DocumentMenu
      x={menuX}
      y={menuY}
      onRename={() => {
        setMenuOpen(false);

        // TODO
      }}
      onDelete={() => {
        setMenuOpen(false);
        setDeleteOpen(true);
      }}
    />
  </div>
)}

<Dialog.Root
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#171717] p-6 shadow-2xl">

      <Dialog.Title className="text-lg font-semibold text-white">
        Delete document
      </Dialog.Title>

      <Dialog.Description className="mt-2 text-sm text-zinc-400">
        Are you sure you want to permanently delete{" "}
        <span className="font-medium text-white">
          {selectedDocument?.name}
        </span>
        ?
      </Dialog.Description>

      <div className="mt-6 flex justify-end gap-3">

        <Dialog.Close asChild>
          <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">
            Cancel
          </button>
        </Dialog.Close>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>

      </div>

    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

</>
  );
}