import { FileText } from "lucide-react";

import { PDFViewer } from "./PDFViewer";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function PDFPanel() {
  const {
    selectedPdf,
    selectedEvidence,
  } = useWorkspaceStore();

  if (!selectedPdf) {
    return (
      <div className="flex h-full items-center justify-center bg-[#090909]">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-zinc-600" />

          <h3 className="text-sm font-semibold text-white">
            No paper selected
          </h3>

          <p className="mt-2 text-xs text-zinc-500">
            Select a document from the library
            or click an evidence card.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PDFViewer
      file={selectedPdf}
      pageNumber={
        selectedEvidence?.pageNumber ?? 1
      }
      startChar={
        selectedEvidence?.startChar
      }
      endChar={
        selectedEvidence?.endChar
      }
    />
  );
}