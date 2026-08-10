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

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string;
  title?: string;
  pageNumber?: number;
  pageWidth?: number | null;
  pageHeight?: number | null;
  bboxes?: number[][];
}

const API = "http://localhost:8000";
const EVIDENCE_ZOOM = 1.25;

interface RenderedPageDimensions {
  width: number;
  height: number;
}

export function PDFViewer({
  file,
  pageNumber: initialPage = 1,
  pageWidth,
  pageHeight,
  bboxes = [],
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] =
    useState(initialPage);

  const [availableWidth, setAvailableWidth] =
    useState<number>();

  const [renderedPage, setRenderedPage] =
    useState<RenderedPageDimensions | null>(
      null
    );

  /*
   * Keep the PDF visually stable while a new
   * evidence target is being calculated.
   *
   * Without this, the user briefly sees the
   * page at its initial position and then watches
   * it jump/scroll to the evidence.
   */
  const [isPositioning, setIsPositioning] =
    useState(true);

  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const renderedPageRef =
    useRef<HTMLDivElement>(null);

  const hasAutoScrolledRef =
    useRef(false);

  const positioningRunRef =
    useRef(0);

  /*
   * A new evidence selection starts a fresh
   * positioning pass.
   */
  useEffect(() => {
    positioningRunRef.current += 1;

    setIsPositioning(true);
    setPageNumber(initialPage);
    setRenderedPage(null);
    hasAutoScrolledRef.current = false;

    const container =
      scrollContainerRef.current;

    if (container) {
      container.scrollTo({
        left: 0,
        top: 0,
        behavior: "auto",
      });
    }
  }, [initialPage, bboxes]);

  /*
   * Measure the actual scroll viewport.
   */
  useEffect(() => {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const update = () => {
      const width = container.clientWidth;

      if (width > 0) {
        setAvailableWidth(
          Math.max(320, width - 48)
        );
      }
    };

    update();

    const observer =
      new ResizeObserver(update);

    observer.observe(container);

    return () =>
      observer.disconnect();
  }, []);

  const measureRenderedPage =
    useCallback(() => {
      const element =
        renderedPageRef.current;

      if (!element) {
        return;
      }

      const width = element.clientWidth;
      const height = element.clientHeight;

      if (width <= 0 || height <= 0) {
        return;
      }

      setRenderedPage({
        width,
        height,
      });
    }, []);

  useEffect(() => {
    const element =
      renderedPageRef.current;

    if (!element) {
      return;
    }

    const measure = () => {
      requestAnimationFrame(
        measureRenderedPage
      );
    };

    measure();

    const observer =
      new ResizeObserver(measure);

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, [
    pageNumber,
    availableWidth,
    measureRenderedPage,
  ]);

  const sourceWidth =
    pageWidth ?? undefined;

  const sourceHeight =
    pageHeight ?? undefined;

  const isEvidencePage =
    pageNumber === initialPage &&
    bboxes.length > 0;

  const pageRenderWidth =
    availableWidth
      ? isEvidencePage
        ? availableWidth * EVIDENCE_ZOOM
        : availableWidth
      : undefined;

  const canRenderHighlights =
    isEvidencePage &&
    renderedPage !== null &&
    sourceWidth !== undefined &&
    sourceHeight !== undefined &&
    sourceWidth > 0 &&
    sourceHeight > 0;

  const scaleX =
    canRenderHighlights
      ? renderedPage.width / sourceWidth
      : 1;

  const scaleY =
    canRenderHighlights
      ? renderedPage.height / sourceHeight
      : 1;

  /*
   * Position the evidence only after the page
   * has reached its final rendered dimensions.
   *
   * The page stays visually hidden during this
   * short positioning pass, so the user never
   * sees the intermediate "render -> jump" state.
   */
  useEffect(() => {
    if (
      !isEvidencePage ||
      !canRenderHighlights ||
      hasAutoScrolledRef.current
    ) {
      return;
    }

    const pageElement =
      renderedPageRef.current;

    const scrollElement =
      scrollContainerRef.current;

    if (
      !pageElement ||
      !scrollElement ||
      bboxes.length === 0
    ) {
      return;
    }

    const validBboxes = bboxes.filter(
      (bbox) =>
        Array.isArray(bbox) &&
        bbox.length === 4 &&
        bbox.every(
          (value) =>
            Number.isFinite(value)
        ) &&
        bbox[2] > bbox[0] &&
        bbox[3] > bbox[1]
    );

    if (validBboxes.length === 0) {
      hasAutoScrolledRef.current = true;
      setIsPositioning(false);
      return;
    }

    const minX = Math.min(
      ...validBboxes.map(
        (bbox) => bbox[0]
      )
    );

    const minY = Math.min(
      ...validBboxes.map(
        (bbox) => bbox[1]
      )
    );

    const maxX = Math.max(
      ...validBboxes.map(
        (bbox) => bbox[2]
      )
    );

    const maxY = Math.max(
      ...validBboxes.map(
        (bbox) => bbox[3]
      )
    );

    const highlightCenterX =
      ((minX + maxX) / 2) * scaleX;

    const highlightCenterY =
      ((minY + maxY) / 2) * scaleY;

    const runId =
      positioningRunRef.current;

    let frameOne = 0;
    let frameTwo = 0;
    let frameThree = 0;

    frameOne = requestAnimationFrame(() => {
      frameTwo = requestAnimationFrame(() => {
        frameThree = requestAnimationFrame(() => {
          /*
           * Ignore stale positioning work if the
           * user clicked another evidence chunk
           * before this pass completed.
           */
          if (
            runId !==
            positioningRunRef.current
          ) {
            return;
          }

          const pageRect =
            pageElement.getBoundingClientRect();

          const scrollRect =
            scrollElement.getBoundingClientRect();

          const pageLeft =
            scrollElement.scrollLeft +
            pageRect.left -
            scrollRect.left;

          const pageTop =
            scrollElement.scrollTop +
            pageRect.top -
            scrollRect.top;

          const targetLeft =
            pageLeft +
            highlightCenterX -
            scrollRect.width / 2;

          const targetTop =
            pageTop +
            highlightCenterY -
            scrollRect.height * 0.40;

          /*
           * Jump into place while the page is hidden.
           * This is intentional: the user should only
           * see the final location.
           */
          scrollElement.scrollTo({
            left: Math.max(
              0,
              targetLeft
            ),
            top: Math.max(
              0,
              targetTop
            ),
            behavior: "auto",
          });

          hasAutoScrolledRef.current = true;

          /*
           * Reveal after the browser has painted
           * the final scroll position.
           */
          requestAnimationFrame(() => {
            if (
              runId ===
              positioningRunRef.current
            ) {
              setIsPositioning(false);
            }
          });
        });
      });
    });

    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      cancelAnimationFrame(frameThree);
    };
  }, [
    bboxes,
    canRenderHighlights,
    isEvidencePage,
    scaleX,
    scaleY,
    renderedPage,
  ]);

  /*
   * Non-evidence pages don't need positioning.
   * Reveal them as soon as their page is rendered.
   */
  const handlePageRenderSuccess = () => {
    requestAnimationFrame(() => {
      measureRenderedPage();

      if (!isEvidencePage) {
        setIsPositioning(false);
      }
    });
  };

  const goPrevious = () => {
    setPageNumber((page) =>
      Math.max(1, page - 1)
    );
  };

  const goNext = () => {
    setPageNumber((page) =>
      Math.min(numPages, page + 1)
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#090909]">

      {/* --------------------------------------- */}
      {/* PDF toolbar */}
      {/* --------------------------------------- */}

      <div
        className="
          relative
          flex
          h-14
          flex-shrink-0
          items-center
          border-b
          border-white/[0.06]
          px-5
        "
      >
        <button
          type="button"
          onClick={goPrevious}
          disabled={pageNumber === 1}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            px-3
            py-2
            text-xs
            font-medium
            text-zinc-400
            transition
            hover:bg-white/[0.06]
            hover:text-zinc-100
            disabled:pointer-events-none
            disabled:opacity-25
          "
        >
          <span className="text-sm">←</span>
          Previous
        </button>

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            text-xs
            tabular-nums
            text-zinc-500
          "
        >
          Page{" "}
          <span className="text-zinc-300">
            {pageNumber}
          </span>
          {" "}of{" "}
          <span className="text-zinc-300">
            {numPages || "—"}
          </span>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={
            pageNumber === numPages ||
            numPages === 0
          }
          className="
            ml-auto
            flex
            items-center
            gap-2
            rounded-lg
            px-3
            py-2
            text-xs
            font-medium
            text-zinc-400
            transition
            hover:bg-white/[0.06]
            hover:text-zinc-100
            disabled:pointer-events-none
            disabled:opacity-25
          "
        >
          Next
          <span className="text-sm">→</span>
        </button>
      </div>

      {/* --------------------------------------- */}
      {/* PDF canvas / scroll viewport */}
      {/* --------------------------------------- */}

      <div
        ref={scrollContainerRef}
        className="
          min-h-0
          flex-1
          overflow-auto
          bg-[#0d0d0d]
          px-6
          py-8
        "
      >
        <Document
          file={`${API}${file}`}
          loading={
            <div className="pt-20 text-center text-zinc-500">
              Loading PDF...
            </div>
          }
          onLoadSuccess={({
            numPages,
          }) => {
            setNumPages(numPages);
          }}
          onLoadError={(error) => {
            console.error(
              "PDF ERROR:",
              error
            );
          }}
        >
          <div
            className="
              flex
              min-w-full
              justify-center
              pb-10
            "
          >
            <div
              className="
                rounded-xl
                bg-white
                p-3
                shadow-[0_20px_60px_rgba(0,0,0,0.45)]
              "
            >
              <div
                ref={renderedPageRef}
                className="
                  relative
                  inline-block
                  transition-opacity
                  duration-150
                "
                style={{
                  opacity:
                    isPositioning
                      ? 0
                      : 1,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageRenderWidth}
                  onRenderSuccess={
                    handlePageRenderSuccess
                  }
                />

                {canRenderHighlights && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                    "
                  >
                    {bboxes.map(
                      (
                        bbox,
                        index
                      ) => {
                        if (
                          !Array.isArray(
                            bbox
                          ) ||
                          bbox.length !== 4
                        ) {
                          return null;
                        }

                        const [
                          x0,
                          y0,
                          x1,
                          y1,
                        ] = bbox;

                        if (
                          [
                            x0,
                            y0,
                            x1,
                            y1,
                          ].some(
                            (coordinate) =>
                              !Number.isFinite(
                                coordinate
                              )
                          )
                        ) {
                          return null;
                        }

                        if (
                          x1 <= x0 ||
                          y1 <= y0
                        ) {
                          return null;
                        }

                        return (
                          <div
                            key={`${index}-${bbox.join(
                              "-"
                            )}`}
                            className="
                              absolute
                              rounded-sm
                              border-2
                              border-amber-400
                              bg-amber-300/30
                            "
                            style={{
                              left:
                                x0 * scaleX,
                              top:
                                y0 * scaleY,
                              width:
                                (x1 - x0) *
                                scaleX,
                              height:
                                (y1 - y0) *
                                scaleY,
                            }}
                          />
                        );
                      }
                    )}
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
