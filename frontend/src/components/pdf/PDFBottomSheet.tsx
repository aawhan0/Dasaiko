import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { PDFViewer } from "./PDFViewer";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function PDFBottomSheet() {
  const {
    selectedPdf,
    selectedEvidence,
    setSelectedPdf,
  } = useWorkspaceStore();

  return (
    <AnimatePresence>
      {selectedPdf && (
        <>
          {/* Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPdf(null)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50
              h-[88vh]
              overflow-hidden
              rounded-t-[28px]
              border-t
              border-white/[0.08]
              bg-[#090909]
              shadow-[0_-20px_80px_rgba(0,0,0,0.6)]
            "
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-16 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Document Viewer
                </h2>

                <p className="text-xs text-zinc-500">
                  {selectedEvidence
                    ? `Page ${selectedEvidence.pageNumber}`
                    : "Source document"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPdf(null)
                }
                className="
                  rounded-xl
                  p-2
                  text-zinc-500
                  transition-all
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <ChevronDown className="h-5 w-5" />
              </button>

            </div>

            <div className="h-[calc(88vh-72px)] overflow-hidden">

              <PDFViewer
                file={selectedPdf}
                pageNumber={
                  selectedEvidence?.pageNumber ?? 1
                }
                // @ts-ignore: bboxes prop is passed through for PDF rendering
                bboxes={selectedEvidence?.bboxes}
              />

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}