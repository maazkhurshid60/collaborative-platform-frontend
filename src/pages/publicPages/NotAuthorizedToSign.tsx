const NotAuthorizedToSign = ({ role }: { role: string }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-600 mb-6 font-medium text-sm leading-relaxed">
          This document view is protected and can only be opened and signed by
          clients.
        </p>
        <a
          href={role === "superAdmin" ? "/pending-users" : "/dashboard"}
          className="inline-flex items-center justify-center rounded-lg bg-primaryColorDark hover:bg-opacity-95 px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md w-full"
        >
          Go back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotAuthorizedToSign;
