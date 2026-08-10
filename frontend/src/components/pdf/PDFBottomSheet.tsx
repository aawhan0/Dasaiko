import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { PDFViewer } from "./PDFViewer";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function PDFBottomSheet() {
  const {
    selectedPdf,
    selectedEvidence,
    setSelectedPdf,
    documents,
  } = useWorkspaceStore();

  const selectedDocument =
    selectedEvidence?.documentId
      ? documents.find(
          (document) =>
            document.id ===
            String(selectedEvidence.documentId)
        )
      : undefined;

  const paperTitle =
    selectedDocument?.title ||
    selectedDocument?.name ||
    "Research Paper";

  return (
    <AnimatePresence>
      {selectedPdf && (
        <>
          {/* --------------------------------------- */}
          {/* Workbench spotlight */}
          {/* --------------------------------------- */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSelectedPdf(null)}
            className="
              absolute
              inset-0
              z-40
              bg-black/65
              backdrop-blur-md
            "
            style={{
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.58) 58%, rgba(0,0,0,0.78) 100%)",
            }}
          />

          {/* --------------------------------------- */}
          {/* Centered document viewer */}
          {/* --------------------------------------- */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.985,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.985,
              y: 8,
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="
              absolute
              inset-5
              z-50
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.10]
              bg-[#090909]
              shadow-[0_30px_100px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.02)]
            "
          >
            {/* ------------------------------------- */}
            {/* Paper header */}
            {/* ------------------------------------- */}

            <header
              className="
                flex
                h-14
                flex-shrink-0
                items-center
                border-b
                border-white/[0.07]
                px-5
              "
            >
              <div className="min-w-0 flex-1">
                <h2
                  className="
                    truncate
                    text-[13px]
                    font-semibold
                    tracking-[-0.01em]
                    text-zinc-100
                  "
                  title={paperTitle}
                >
                  {paperTitle}
                </h2>

                <p className="mt-0.5 text-[10px] text-zinc-600">
                  Research paper
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPdf(null)}
                aria-label="Close document viewer"
                className="
                  ml-4
                  flex
                  h-8
                  w-8
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-zinc-500
                  transition
                  hover:bg-white/[0.06]
                  hover:text-zinc-200
                "
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* ------------------------------------- */}
            {/* PDF */}
            {/* ------------------------------------- */}

            <div className="min-h-0 flex-1 overflow-hidden">
              <PDFViewer
                file={selectedPdf}
                title={paperTitle}
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
                  selectedEvidence?.bboxes
                }
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
