import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  X,
  Sparkles,
} from "lucide-react";

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
            String(selectedEvidence.documentId),
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
          {/* =================================================
              WORKSPACE OVERLAY
          ================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() =>
              setSelectedPdf(null)
            }
            className="
              absolute
              inset-0
              z-40
              bg-black/75
              backdrop-blur-md
            "
          />

          {/* =================================================
              DOCUMENT VIEWER
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.985,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.985,
              y: 10,
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="
              absolute
              inset-3
              z-50
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.12]
              bg-[#080808]
              shadow-[0_40px_120px_rgba(0,0,0,0.82)]
              sm:inset-4
              lg:inset-5
            "
          >
            {/* =================================================
                DOCUMENT HEADER
            ================================================== */}

            <header
              className="
                relative
                flex
                min-h-[64px]
                shrink-0
                items-center
                border-b
                border-white/[0.08]
                bg-[#090909]
                px-4
                sm:px-5
              "
            >
              {/* subtle header glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-primary/30
                  to-transparent
                "
              />

              {/* Document identity */}

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-3
                  sm:gap-4
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/[0.09]
                    bg-white/[0.035]
                    shadow-[0_0_20px_rgba(99,102,241,0.06)]
                  "
                >
                  <FileText
                    className="
                      h-4
                      w-4
                      text-zinc-300
                    "
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      truncate
                      text-[13px]
                      font-bold
                      tracking-[-0.01em]
                      text-white
                      sm:text-sm
                    "
                    title={paperTitle}
                  >
                    {paperTitle}
                  </h2>

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-zinc-600
                      "
                    >
                      Research paper
                    </span>

                    {selectedEvidence && (
                      <>
                        <span
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-zinc-700
                          "
                        />

                        <span
                          className="
                            text-[9px]
                            font-mono
                            font-medium
                            text-zinc-600
                          "
                        >
                          Page{" "}
                          {
                            selectedEvidence.pageNumber
                          }
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence context */}

              {selectedEvidence && (
                <div
                  className="
                    mr-3
                    hidden
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-primary/20
                    bg-primary/[0.07]
                    px-3
                    py-2
                    sm:flex
                  "
                >
                  <div
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-md
                      bg-primary/15
                    "
                  >
                    <Sparkles
                      className="
                        h-3
                        w-3
                        text-primary
                      "
                    />
                  </div>

                  <div className="flex flex-col">
                    <span
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-primary/70
                      "
                    >
                      Evidence
                    </span>

                    <span
                      className="
                        text-[9px]
                        font-mono
                        font-semibold
                        text-zinc-400
                      "
                    >
                      Highlighted passage
                    </span>
                  </div>
                </div>
              )}

              {/* Close */}

              <button
                type="button"
                onClick={() =>
                  setSelectedPdf(null)
                }
                aria-label="Close document viewer"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  text-zinc-500
                  transition-all
                  duration-200
                  hover:border-white/[0.14]
                  hover:bg-white/[0.06]
                  hover:text-white
                  active:scale-95
                "
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* =================================================
                PDF
            ================================================== */}

            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
              "
            >
              <PDFViewer
                file={selectedPdf}
                title={paperTitle}
                pageNumber={
                  selectedEvidence?.pageNumber ??
                  1
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