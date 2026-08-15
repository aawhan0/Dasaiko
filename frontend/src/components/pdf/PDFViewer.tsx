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
  const [numPages, setNumPages] =
    useState(0);

  const [pageNumber, setPageNumber] =
    useState(initialPage);

  const [availableWidth, setAvailableWidth] =
    useState<number>();

  const [renderedPage, setRenderedPage] =
    useState<RenderedPageDimensions | null>(
      null,
    );

  /*
   * Keep the PDF visually stable while a new
   * evidence target is being calculated.
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
      const width =
        container.clientWidth;

      if (width > 0) {
        setAvailableWidth(
          Math.max(320, width - 48),
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

      const width =
        element.clientWidth;

      const height =
        element.clientHeight;

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
        measureRenderedPage,
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
      ? renderedPage.width /
        sourceWidth
      : 1;

  const scaleY =
    canRenderHighlights
      ? renderedPage.height /
        sourceHeight
      : 1;

  /*
   * Position the evidence only after the page
   * has reached its final rendered dimensions.
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

    const validBboxes =
      bboxes.filter(
        (bbox) =>
          Array.isArray(bbox) &&
          bbox.length === 4 &&
          bbox.every(
            (value) =>
              Number.isFinite(value),
          ) &&
          bbox[2] > bbox[0] &&
          bbox[3] > bbox[1],
      );

    if (validBboxes.length === 0) {
      hasAutoScrolledRef.current = true;
      setIsPositioning(false);
      return;
    }

    const minX = Math.min(
      ...validBboxes.map(
        (bbox) => bbox[0],
      ),
    );

    const minY = Math.min(
      ...validBboxes.map(
        (bbox) => bbox[1],
      ),
    );

    const maxX = Math.max(
      ...validBboxes.map(
        (bbox) => bbox[2],
      ),
    );

    const maxY = Math.max(
      ...validBboxes.map(
        (bbox) => bbox[3],
      ),
    );

    const highlightCenterX =
      ((minX + maxX) / 2) *
      scaleX;

    const highlightCenterY =
      ((minY + maxY) / 2) *
      scaleY;

    const runId =
      positioningRunRef.current;

    let frameOne = 0;
    let frameTwo = 0;
    let frameThree = 0;

    frameOne =
      requestAnimationFrame(() => {
        frameTwo =
          requestAnimationFrame(() => {
            frameThree =
              requestAnimationFrame(() => {
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
                  scrollRect.height * 0.4;

                scrollElement.scrollTo({
                  left: Math.max(
                    0,
                    targetLeft,
                  ),
                  top: Math.max(
                    0,
                    targetTop,
                  ),
                  behavior: "auto",
                });

                hasAutoScrolledRef.current =
                  true;

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
   */
  const handlePageRenderSuccess =
    () => {
      requestAnimationFrame(() => {
        measureRenderedPage();

        if (!isEvidencePage) {
          setIsPositioning(false);
        }
      });
    };

  const goPrevious = () => {
    setPageNumber((page) =>
      Math.max(1, page - 1),
    );
  };

  const goNext = () => {
    setPageNumber((page) =>
      Math.min(numPages, page + 1),
    );
  };

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-[#080808]
      "
    >
      {/* =================================================
          PDF TOOLBAR
      ================================================== */}

      <div
        className="
          relative
          flex
          h-16
          shrink-0
          items-center
          border-b
          border-white/[0.08]
          bg-[#090909]
          px-4
          sm:px-5
        "
      >
        {/* Previous */}

        <button
          type="button"
          onClick={goPrevious}
          disabled={pageNumber === 1}
          className="
            group
            flex
            h-9
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-3.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-zinc-500
            transition-all
            duration-200
            hover:border-white/[0.14]
            hover:bg-white/[0.06]
            hover:text-white
            disabled:pointer-events-none
            disabled:opacity-25
          "
        >
          <span
            className="
              text-base
              leading-none
              transition-transform
              duration-200
              group-hover:-translate-x-0.5
            "
          >
            ←
          </span>

          <span className="hidden sm:inline">
            Previous
          </span>
        </button>

        {/* Page indicator */}

        <div
          className="
            absolute
            left-1/2
            flex
            h-9
            -translate-x-1/2
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.09]
            bg-white/[0.035]
            px-3.5
            font-mono
            text-[10px]
            font-bold
          "
        >
          <span
            className="
              text-[8px]
              font-bold
              tracking-[0.14em]
              text-zinc-600
            "
          >
            PAGE
          </span>

          <span className="text-white">
            {pageNumber}
          </span>

          <span className="text-zinc-700">
            /
          </span>

          <span className="text-zinc-500">
            {numPages || "—"}
          </span>
        </div>

        {/* Next */}

        <button
          type="button"
          onClick={goNext}
          disabled={
            pageNumber === numPages ||
            numPages === 0
          }
          className="
            group
            ml-auto
            flex
            h-9
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-3.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-zinc-500
            transition-all
            duration-200
            hover:border-white/[0.14]
            hover:bg-white/[0.06]
            hover:text-white
            disabled:pointer-events-none
            disabled:opacity-25
          "
        >
          <span className="hidden sm:inline">
            Next
          </span>

          <span
            className="
              text-base
              leading-none
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          >
            →
          </span>
        </button>
      </div>

      {/* =================================================
          PDF CANVAS
      ================================================== */}

      <div
        ref={scrollContainerRef}
        className="
          min-h-0
          flex-1
          overflow-auto
          bg-[#101010]
          px-5
          py-8
          sm:px-6
          sm:py-9

          [scrollbar-color:rgba(255,255,255,0.14)_transparent]
          [scrollbar-width:thin]
        "
      >
        <Document
          file={`${API}${file}`}
          loading={
            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
                text-[11px]
                font-semibold
                text-zinc-600
              "
            >
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
              error,
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
            {/* =================================================
                PAPER FRAME
            ================================================== */}

            <div
              className="
                rounded-sm
                bg-white
                p-2
                shadow-[0_28px_90px_rgba(0,0,0,0.60)]
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

                {/* =================================================
                    EVIDENCE HIGHLIGHTS
                ================================================== */}

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
                        index,
                      ) => {
                        if (
                          !Array.isArray(
                            bbox,
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
                                coordinate,
                              ),
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
                              "-",
                            )}`}
                            className="
                              absolute
                              rounded-[2px]
                              border
                              border-primary/80
                              bg-primary/15
                              shadow-[0_0_14px_rgba(99,102,241,0.18)]
                            "
                            style={{
                              left:
                                x0 *
                                scaleX,
                              top:
                                y0 *
                                scaleY,
                              width:
                                (x1 - x0) *
                                scaleX,
                              height:
                                (y1 - y0) *
                                scaleY,
                            }}
                          />
                        );
                      },
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