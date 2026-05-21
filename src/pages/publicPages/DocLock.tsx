interface DocLockProps {
  errorState: {
    status: number;
    message: string;
  };
}

const DocLock = ({ errorState }: DocLockProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        {errorState.status === 423 ? (
          <div className="mb-6 flex justify-center text-amber-500">
            {/* Locked Icon */}
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        ) : (
          <div className="mb-6 flex justify-center text-red-500">
            {/* Warn Icon */}
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {errorState.status === 423
            ? "Form Already Completed"
            : "Form Access Denied"}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {errorState.message}
        </p>
        <div className="border-t border-gray-100 pt-6">
          <span className="text-xs text-gray-400 font-mono">
            HIPAA Transaction Code: {errorState.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocLock;
