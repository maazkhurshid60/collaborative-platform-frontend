import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, CreditCard, X, Home, RefreshCcw } from "lucide-react";
import logo from "../../../public/assets/logo.png";
import profileImg from "../../../public/assets/profile-img.png";

export const PaymentFailurePage = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins]">
            {/* Custom Header - Hide if in dashboard (token exists) */}
            {!token && (
                <header className="bg-white px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Kolabme" className="h-12 w-auto object-contain" />
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-[600px] mx-4 md:mx-10 hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3] group-focus-within:text-[#2C9993] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by CNIC..."
                                className="w-full bg-white border border-[#E2E8F0] rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-[#2C9993] focus:ring-1 focus:ring-[#2C9993] transition-all text-[#101828] placeholder-[#667085]"
                            />
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] overflow-hidden">
                            <img src={profileImg} alt="John Doe" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#101828]">John Doe</span>
                            <span className="text-[12px] text-[#667085]">Physiotherapist</span>
                        </div>
                        <ChevronDown size={18} className="text-[#667085] group-hover:text-[#101828] transition-colors" />
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="w-full mx-auto px-4 md:px-6 py-12 lg:py-32 flex justify-center">
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm p-8 md:p-16 flex flex-col items-center w-full max-w-[1474px] mx-auto">

                    {/* Failure Icon */}
                    <div className="relative mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="174" height="174" viewBox="0 0 174 174" fill="none">
                            <circle cx="86.8365" cy="86.8365" r="86.8365" fill="url(#paint0_linear_2679_5641)" />
                            <path d="M111.587 59.229H62.0869C58.4402 59.229 54.9428 60.6777 52.3642 63.2563C49.7856 65.8349 48.3369 69.3323 48.3369 72.979V100.479C48.3369 104.126 49.7856 107.623 52.3642 110.202C54.9428 112.78 58.4402 114.229 62.0869 114.229H81.3369C82.0663 114.229 82.7657 113.939 83.2815 113.424C83.7972 112.908 84.0869 112.208 84.0869 111.479C84.0869 110.75 83.7972 110.05 83.2815 109.534C82.7657 109.019 82.0663 108.729 81.3369 108.729H62.0869C59.8989 108.729 57.8005 107.86 56.2533 106.313C54.7061 104.765 53.8369 102.667 53.8369 100.479V81.229H119.837V83.979C119.837 84.7083 120.127 85.4078 120.642 85.9235C121.158 86.4393 121.858 86.729 122.587 86.729C123.316 86.729 124.016 86.4393 124.531 85.9235C125.047 85.4078 125.337 84.7083 125.337 83.979V72.979C125.337 69.3323 123.888 65.8349 121.31 63.2563C118.731 60.6777 115.234 59.229 111.587 59.229ZM53.8369 75.729V72.979C53.8369 70.791 54.7061 68.6925 56.2533 67.1454C57.8005 65.5982 59.8989 64.729 62.0869 64.729H111.587C113.775 64.729 115.873 65.5982 117.421 67.1454C118.968 68.6925 119.837 70.791 119.837 72.979V75.729H53.8369Z" fill="white" />
                            <path d="M113.539 101.277C113.283 101.019 112.979 100.814 112.644 100.675C112.309 100.535 111.949 100.463 111.586 100.463C111.223 100.463 110.864 100.535 110.529 100.675C110.194 100.814 109.889 101.019 109.634 101.277L107.461 103.477L105.289 101.277C104.771 100.759 104.069 100.468 103.336 100.468C102.604 100.468 101.902 100.759 101.384 101.277C100.866 101.794 100.575 102.497 100.575 103.229C100.575 103.961 100.866 104.664 101.384 105.182L103.584 107.354L101.384 109.527C101.126 109.782 100.921 110.086 100.782 110.421C100.642 110.757 100.57 111.116 100.57 111.479C100.57 111.842 100.642 112.202 100.782 112.537C100.921 112.872 101.126 113.176 101.384 113.432C101.639 113.689 101.944 113.894 102.279 114.034C102.614 114.173 102.973 114.245 103.336 114.245C103.699 114.245 104.059 114.173 104.394 114.034C104.729 113.894 105.033 113.689 105.289 113.432L107.461 111.232L109.634 113.432C109.889 113.689 110.194 113.894 110.529 114.034C110.864 114.173 111.223 114.245 111.586 114.245C111.949 114.245 112.309 114.173 112.644 114.034C112.979 113.894 113.283 113.689 113.539 113.432C113.797 113.176 114.001 112.872 114.141 112.537C114.28 112.202 114.352 111.842 114.352 111.479C114.352 111.116 114.28 110.757 114.141 110.421C114.001 110.086 113.797 109.782 113.539 109.527L111.339 107.354L113.539 105.182C113.797 104.926 114.001 104.622 114.141 104.287C114.28 103.952 114.352 103.592 114.352 103.229C114.352 102.866 114.28 102.507 114.141 102.171C114.001 101.836 113.797 101.532 113.539 101.277Z" fill="white" />
                            <path d="M107.462 89.479C103.927 89.479 100.471 90.5274 97.5311 92.4915C94.5916 94.4556 92.3005 97.2473 90.9476 100.514C89.5947 103.78 89.2407 107.374 89.9304 110.841C90.6201 114.309 92.3225 117.494 94.8224 119.994C97.3223 122.493 100.507 124.196 103.975 124.886C107.442 125.575 111.036 125.221 114.302 123.868C117.569 122.515 120.36 120.224 122.324 117.285C124.289 114.345 125.337 110.889 125.337 107.354C125.33 102.615 123.444 98.0731 120.093 94.7225C116.743 91.3719 112.2 89.4863 107.462 89.479ZM107.462 119.729C105.014 119.729 102.622 119.003 100.587 117.643C98.5517 116.284 96.9655 114.351 96.0289 112.09C95.0923 109.828 94.8472 107.34 95.3247 104.94C95.8022 102.539 96.9808 100.334 98.7115 98.6036C100.442 96.8729 102.647 95.6943 105.048 95.2168C107.448 94.7393 109.936 94.9844 112.198 95.921C114.459 96.8576 116.392 98.4438 117.751 100.479C119.111 102.514 119.837 104.906 119.837 107.354C119.83 110.634 118.524 113.777 116.204 116.096C113.885 118.416 110.742 119.722 107.462 119.729Z" fill="white" />
                            <g filter="url(#filter0_d_2679_5641)">
                                <circle cx="86.8363" cy="86.8365" r="74.8289" stroke="white" stroke-opacity="0.7" stroke-width="2.19629" />
                            </g>
                            <defs>
                                <filter id="filter0_d_2679_5641" x="6.51659" y="9.81128" width="160.64" height="160.639" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="3.29444" />
                                    <feGaussianBlur stdDeviation="2.19629" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2679_5641" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2679_5641" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_2679_5641" x1="86.8365" y1="0" x2="86.8365" y2="173.673" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#EA6A6A" />
                                    <stop offset="1" stop-color="#992C2C" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="text-[28px] md:text-[36px] font-bold text-[#101828] mb-4 text-center">Payment Failed</h1>
                    <p className="text-[15px] md:text-[18px] text-[#667085] text-center mb-10 leading-relaxed max-w-[650px]">
                        We couldn't process your payment. This might be due to insufficient funds,
                        an expired card, or your bank declining the transaction.
                        Please try again or use a different payment method.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 rounded-xl border-2 border-[#E2E8F0] bg-white text-[#101828] font-medium text-[18px] md:text-[20px] hover:bg-[#F9FAFB] transition-all cursor-pointer"
                        >
                            <span>Go to Home</span>
                        </button>
                        <button
                            onClick={() => navigate("/billing/change-plan")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-[#2C9993] text-white font-medium text-[18px] md:text-[20px] hover:bg-[#237c76] shadow-lg shadow-[#2c9993]/20 transition-all cursor-pointer"
                        >
                            <span>Retry Payment</span>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};