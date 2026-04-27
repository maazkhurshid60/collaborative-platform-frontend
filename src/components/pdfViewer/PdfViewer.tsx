import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  url: string;
};

export default function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 40);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const goToPrev = useCallback(() => setCurrentPage(p => Math.max(1, p - 1)), []);
  const goToNext = useCallback(() => setCurrentPage(p => Math.min(numPages, p + 1)), [numPages]);
  const zoomIn  = () => setScale(s => Math.min(2.5, parseFloat((s + 0.25).toFixed(2))));
  const zoomOut = () => setScale(s => Math.max(0.5, parseFloat((s - 0.25).toFixed(2))));

  return (
    <div className="w-full flex flex-col gap-3" ref={containerRef}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </button>

          <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
            {numPages > 0 ? `${currentPage} / ${numPages}` : "Loading..."}
          </span>

          <button
            onClick={goToNext}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Zoom + Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} className="text-gray-700" />
          </button>

          <span className="text-xs font-medium text-gray-600 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} className="text-gray-700" />
          </button>

          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
            title="Download PDF"
          >
            <Download size={16} className="text-gray-700" />
          </a>
        </div>
      </div>

      {/* PDF Render area — ONE page at a time */}
      <div className="h-[55vh] w-full overflow-y-auto overflow-x-auto rounded-xl border bg-gray-50 shadow-sm flex flex-col items-center">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C9993]"></div>
              <p className="text-sm text-gray-500 font-[Poppins]">Loading PDF...</p>
            </div>
          }
          error={<p className="text-red-500 m-auto mt-8 font-[Poppins]">Failed to load PDF.</p>}
        >
          {numPages > 0 && (
            <div className="shadow-md my-4 bg-white">
              <Page
                key={`page_${currentPage}_${scale}`}
                pageNumber={currentPage}
                width={containerWidth * scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C9993]"></div>
                  </div>
                }
              />
            </div>
          )}
        </Document>
      </div>

      {/* Bottom page indicator dots (up to 10 pages shown) */}
      {numPages > 1 && (
        <div className="flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: Math.min(numPages, 10) }, (_, i) => i + 1).map(pg => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
                pg === currentPage
                  ? "bg-primaryColorDark text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {pg}
            </button>
          ))}
          {numPages > 10 && (
            <span className="text-xs text-gray-400 self-center">…{numPages} pages total</span>
          )}
        </div>
      )}
    </div>
  );
}
