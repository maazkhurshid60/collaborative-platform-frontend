const NoRecordFound = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[calc(100vh-280px)] flex-col items-center justify-center p-6">
      <div className="relative mb-12">
        {/* Minimalist Background Circle */}
        <div className="absolute inset-0 -m-8 bg-primaryColorDark/5 rounded-full blur-3xl animate-pulse" />

        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative text-primaryColorDark/20"
        >
          <path
            d="M21 7L12 12L3 7L12 2L21 7Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7V17L12 22V12"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 7V17L12 22"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Overlaid Search Glass */}
        <div className="absolute inset-0 flex items-center justify-center translate-x-4 translate-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce [animation-duration:4s]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2C9993"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
          No matching records
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          We couldn't find what you're looking for. Try adjusting your filters
          or search terms to broaden your results.
        </p>
      </div>
    </div>
  );
};

export default NoRecordFound;
