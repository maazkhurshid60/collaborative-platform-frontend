import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfViewerProps = { url: string };

const PdfViewer = ({ url }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState(0);

  // If your server uses cookie auth, this is required:
  const file = useMemo(() => ({ url, withCredentials: true }), [url]);

  return (
    <div className="h-[300px] overflow-auto">
      <Document
        file={file}
        loading={<p className="p-4">Loading PDF...</p>}
        error={<p className="p-4">Unable to render PDF. Check console.</p>}
        onLoadSuccess={(info) => setNumPages(info.numPages)}
        onLoadError={(e) => console.error("PDF load error details:", e)}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="flex justify-center py-2">
            <Page pageNumber={i + 1} />
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;


