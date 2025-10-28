const VerifiedRibbonBadge = () => {
    return (
        <div className="relative inline-block text-center">
            <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center border-4 border-white shadow-lg">
                <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 bg-green-600 w-3 h-5 rotate-45 origin-top-left" />
            <div className="absolute bottom-[-12px] right-1/2 transform translate-x-1/2 bg-green-600 w-3 h-5 -rotate-45 origin-top-right" />
            <p className="mt-2 text-xs font-semibold text-green-700">Verified</p>
        </div>
    );
};

export default VerifiedRibbonBadge;
