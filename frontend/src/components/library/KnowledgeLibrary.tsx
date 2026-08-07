import { useState } from "react";
import { motion } from "framer-motion";

import { fadeIn } from "@/utils/animations";

import { DocumentCard } from "./DocumentCard";
import { SearchBar } from "./SearchBar";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function KnowledgeLibrary() {
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
  } = useWorkspaceStore();

  const [query, setQuery] = useState("");

  console.log(documents);


  console.log("DOCUMENTS:");
  console.table(documents);

  const filteredDocuments = documents.filter((doc) =>
    (doc.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

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
            />
          ))
        )}
      </div>
    </motion.div>
  );
}