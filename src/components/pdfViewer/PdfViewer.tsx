import { useMemo, useState } from "react";

type PdfViewerProps = {
  url: string;      // must be publicly accessible
  maxPages?: number;
};

export default function PdfViewer({ url, maxPages }: PdfViewerProps) {
  const [page, setPage] = useState(1);

  const prev = () => setPage((p) => Math.max(1, p - 1));


  const src = useMemo(() => {
    const gview = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    return `${gview}#page=${page}`;
  }, [url, page]);

  return (
    <div className="w-full">
      {/* <div className="mb-3 grid grid-cols-3 items-center gap-2">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={prev}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">←</span>
            Prev
          </button>
        </div>

        <div className="flex justify-center text-sm tabular-nums text-gray-600">
          
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={next}
            disabled={page >= maxPages}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div> */}

      <div className="h-[55vh] w-full overflow-hidden rounded-xl border bg-gray-50 shadow-sm">
        <iframe key={page} className="h-full w-full border-0" src={src} title="PDF" />
      </div>
    </div>
  );
}
