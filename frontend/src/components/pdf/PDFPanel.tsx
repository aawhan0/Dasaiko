import { FileText, ArrowRight } from "lucide-react";

import { PDFViewer } from "./PDFViewer";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function PDFPanel() {
  const {
    selectedPdf,
    selectedEvidence,
  } = useWorkspaceStore();

  if (!selectedPdf) {
    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-[#090909]
          px-6
        "
      >
        <div
          className="
            flex
            max-w-xs
            flex-col
            items-center
            text-center
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border-[1.5px]
              border-white/[0.08]
              bg-white/[0.025]
            "
          >
            <FileText
              className="
                h-4
                w-4
                text-zinc-500
              "
            />
          </div>

          <h3
            className="
              mt-4
              text-[13px]
              font-bold
              tracking-tight
              text-zinc-300
            "
          >
            No paper selected
          </h3>

          <p
            className="
              mt-2
              text-[11px]
              font-medium
              leading-5
              text-zinc-600
            "
          >
            Select a document from your
            library or open an evidence
            source to inspect the paper here.
          </p>

          <div
            className="
              mt-5
              flex
              items-center
              gap-2
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-zinc-600
            "
          >
            Evidence
            <ArrowRight
              className="
                h-3
                w-3
                text-primary/50
              "
            />
            Paper
          </div>
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
      pageWidth={
        selectedEvidence?.pageWidth
      }
      pageHeight={
        selectedEvidence?.pageHeight
      }
      bboxes={
        selectedEvidence?.bboxes ?? []
      }
    />
  );
}