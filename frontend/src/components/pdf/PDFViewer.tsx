import { useState } from "react";
import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string;
}

const API = "http://localhost:8000";

export function PDFViewer({
  file,
}: PDFViewerProps) {
  const [numPages, setNumPages] =
    useState(0);

  const [pageNumber, setPageNumber] =
    useState(1);

  return (
    <div className="flex h-full flex-col bg-[#090909]">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-8 py-4">

        <button
          onClick={() =>
            setPageNumber((p) =>
              Math.max(1, p - 1)
            )
          }
          disabled={pageNumber === 1}
          className="
            rounded-lg
            border
            border-white/[0.08]
            px-4
            py-2
            text-sm
            text-zinc-300
            transition
            hover:bg-white/[0.05]
            disabled:opacity-30
          "
        >
          ← Previous
        </button>

        <div className="text-sm text-zinc-400">
          Page {pageNumber} of {numPages}
        </div>

        <button
          onClick={() =>
            setPageNumber((p) =>
              Math.min(numPages, p + 1)
            )
          }
          disabled={pageNumber === numPages}
          className="
            rounded-lg
            border
            border-white/[0.08]
            px-4
            py-2
            text-sm
            text-zinc-300
            transition
            hover:bg-white/[0.05]
            disabled:opacity-30
          "
        >
          Next →
        </button>

      </div>

      {/* PDF */}
      <div className="flex-1 overflow-auto bg-[#0d0d0d] p-8">

        <Document
          file={`${API}${file}`}
          loading={
            <div className="mt-20 text-center text-zinc-500">
              Loading PDF...
            </div>
          }
          onLoadSuccess={({ numPages }) =>
            setNumPages(numPages)
          }
          onLoadError={(err) =>
            console.error(err)
          }
        >
          <div className="flex justify-center pb-12">

            <div className="rounded-xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

              <Page
                pageNumber={pageNumber}
                width={900}
              />

            </div>

          </div>

        </Document>

      </div>

    </div>
  );
}