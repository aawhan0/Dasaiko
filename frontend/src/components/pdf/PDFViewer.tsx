import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

  pageNumber?: number;

  pageWidth?: number | null;

  pageHeight?: number | null;

  bboxes?: number[][];
}

const API = "http://localhost:8000";

interface RenderedPageDimensions {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export function PDFViewer({
  file,
  pageNumber: initialPage = 1,
  pageWidth,
  pageHeight,
  bboxes = [],
}: PDFViewerProps) {
  const [numPages, setNumPages] =
    useState(0);

  const [pageNumber, setPageNumber] =
    useState(initialPage);

  const [availableWidth, setAvailableWidth] =
    useState<number>();

  const [renderedPage, setRenderedPage] =
    useState<RenderedPageDimensions | null>(
      null
    );

  const pageContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const container = pageContainerRef.current;

    if (!container) return;

    const updateAvailableWidth = () => {
      setAvailableWidth(container.clientWidth);
    };

    updateAvailableWidth();

    const observer = new ResizeObserver(
      updateAvailableWidth
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const handlePageRenderSuccess = useCallback(
    (page: RenderedPageDimensions) => {
      setRenderedPage(page);
    },
    []
  );

  const sourceWidth =
    pageWidth ??
    renderedPage?.originalWidth ??
    renderedPage?.width;

  const sourceHeight =
    pageHeight ??
    renderedPage?.originalHeight ??
    renderedPage?.height;

  const canRenderHighlights =
    pageNumber === initialPage &&
    renderedPage !== null &&
    sourceWidth !== undefined &&
    sourceHeight !== undefined &&
    sourceWidth > 0 &&
    sourceHeight > 0;

  return (
    <div className="flex h-full flex-col bg-[#090909]">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-4">

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
          disabled={
            pageNumber === numPages
          }
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
          onLoadSuccess={({
            numPages,
          }) =>
            setNumPages(numPages)
          }
          onLoadError={(err) =>
            console.error(
              "PDF ERROR:",
              err
            )
          }
        >
          <div
            ref={pageContainerRef}
            className="flex justify-center pb-12"
          >

            <div className="rounded-xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

              <div className="relative inline-block">
                <Page
                  pageNumber={pageNumber}
                  width={availableWidth}
                  onRenderSuccess={
                    handlePageRenderSuccess
                  }
                />

                {canRenderHighlights && (
                  <div className="pointer-events-none absolute inset-0">
                    {bboxes.map((bbox, index) => {
                      const [x0, y0, x1, y1] = bbox;

                      if (
                        [x0, y0, x1, y1].some(
                          (coordinate) =>
                            !Number.isFinite(coordinate)
                        )
                      ) {
                        return null;
                      }

                      const scaleX =
                        renderedPage.width / sourceWidth;
                      const scaleY =
                        renderedPage.height / sourceHeight;

                      return (
                        <div
                          key={`${index}-${bbox.join("-")}`}
                          className="absolute rounded-sm border-2 border-amber-400 bg-amber-300/30"
                          style={{
                            left: x0 * scaleX,
                            top: y0 * scaleY,
                            width: (x1 - x0) * scaleX,
                            height: (y1 - y0) * scaleY,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </Document>

      </div>

    </div>
  );
}
