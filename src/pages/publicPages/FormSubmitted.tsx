interface FormSubmittedProps {
  clientName?: string;
  submittedId?: string;
  submittedValues: any;
  isGeneratingPdf: boolean;
  handleDownloadPDF: () => void;
}

const FormSubmitted = ({
  clientName,
  submittedId,
  submittedValues,
  isGeneratingPdf,
  handleDownloadPDF,
}: FormSubmittedProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center">
        <div className="mb-6 flex justify-center text-green-500">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Form Locked &amp; Submitted
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Thank you, {clientName || "Client"}. Your record has been legally
          sealed, encrypted, and locked to prevent tampering in compliance with
          HIPAA privacy acts.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 text-left">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
            Confirmation Lock ID
          </div>
          <div className="text-sm font-mono text-gray-700 break-all select-all">
            {submittedId || "LOCKED_RECORD_OK"}
          </div>
        </div>

        {submittedValues && (
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="mb-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 transition duration-150 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {isGeneratingPdf ? "Generating PDF..." : "Download Completed PDF Copy"}
          </button>
        )}

        <div className="text-xs text-gray-400 font-mono">
          Transaction Sealed: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default FormSubmitted;
