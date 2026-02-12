import { useNavigate } from "react-router-dom";
import { Check, Copy, FileText, LayoutDashboard, Search, ChevronDown } from "lucide-react";
import logo from "../../../public/assets/logo.png";
import profileImg from "../../../public/assets/profile-img.png";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import authService from "../../apiServices/authApi/AuthApi";
import { saveLoginUserDetailsReducer } from "../../redux/slices/LoginUserDetailSlice";
import { subscriptionApiService } from "../../services/subscriptionApiService";

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");

    // Get user details from Redux
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
    const loginUserId = userDetails?.id;
    const role = userDetails?.user?.role;

    // 🔄 Force Sync and Refresh user data after payment
    useEffect(() => {
        const syncAndRefresh = async () => {
            if (!token || !loginUserId || !role) return;

            try {
                console.log("🔄 Force syncing subscription status after payment...");

                // 1. Force Backend to Sync with Stripe
                await subscriptionApiService.syncSubscription().catch((err: any) => {
                    console.warn("⚠️ Sync request failed (webhook might handle it), proceeding to refresh...", err);
                });

                // 2. Refresh local Redux data
                console.log("🔄 Refreshing user data...");
                const response = await authService.getMe(loginUserId, role);

                if (response?.data?.data) {
                    dispatch(saveLoginUserDetailsReducer(response.data.data));
                    console.log("✅ User data refreshed with subscription:", response.data.data.user?.subscription);
                }
            } catch (error) {
                console.error("❌ Failed to sync/refresh user data:", error);
            }
        };

        syncAndRefresh();

        // Auto-redirect to dashboard after 3 seconds
        const timer = setTimeout(() => {
            navigate("/dashboard");
        }, 3000);

        return () => clearTimeout(timer);
    }, [token, loginUserId, role, dispatch, navigate]);

    const features = [
        "Unlimited customers",
        "Custom billing workflows",
        "Dedicated account manager",
        "White-label options",
        "Custom integrations",
        "Advanced security & compliance"
    ];

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins]">
            {/* Custom Header - Hide if in dashboard (token exists) */}
            {!token && (
                <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Kolabme" className="h-12 w-auto object-contain" />
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-[600px] mx-10">
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
            <main className="max-w-[1280px] mx-auto px-6 py-12">
                <div className="bg-white rounded-[32px] shadow-sm p-12 flex flex-col items-center">

                    {/* Success Icon & Status */}
                    <div className="relative mb-8">
                        {/* Decorative Elements */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="299" height="264" viewBox="0 0 299 264" fill="none">
                            <path d="M251.536 55.0813C260.221 55.9257 278.388 53.1271 281.573 35.1775C284.758 17.2278 293.274 12.2579 297.134 12.0166" stroke="#F3603F" stroke-width="3.29444" stroke-linecap="round" />
                            <path d="M239.426 215.135C247.532 217.477 263.205 226.376 261.043 243.237" stroke="#F7B23B" stroke-width="3.29444" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M1.64746 191.341C14.0875 196.026 40.9063 199.386 48.6612 175.346M48.6612 175.346C49.7922 168.722 48.6614 155.62 35.0904 156.202C32.5054 162.583 31.6005 175.346 48.6612 175.346ZM48.6612 175.346C54.3158 176.396 67.4668 175.395 74.8339 162.987" stroke="#6E89FA" stroke-width="3.29444" stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="199.063" cy="255.569" r="8.32348" fill="#637BFE" />
                            <circle cx="277.751" cy="123.761" r="7.7744" stroke="#C05EFD" stroke-width="1.09815" />
                            <circle cx="145.621" cy="9.11491" r="9.11491" fill="url(#paint0_linear_2656_789)" />
                            <circle cx="171.5" cy="24.5004" r="4.81367" fill="#F3603F" />
                            <circle cx="65.4056" cy="95.1942" r="7.88682" stroke="#F7B23B" stroke-width="1.09815" />
                            <circle cx="84.7818" cy="228.212" r="8.72685" stroke="url(#paint1_linear_2656_789)" stroke-width="1.09815" />
                            <circle cx="4.43146" cy="4.43146" r="4.43146" transform="matrix(-1 0 0 1 177.613 241.593)" fill="url(#paint2_linear_2656_789)" />
                            <circle cx="174.14" cy="132.196" r="86.8365" fill="url(#paint3_linear_2656_789)" />
                            <g filter="url(#filter0_d_2656_789)">
                                <circle cx="174.14" cy="132.196" r="74.8289" stroke="white" stroke-opacity="0.7" stroke-width="2.19629" />
                            </g>
                            <path d="M212.729 113.198C212.729 115.562 211.801 117.845 210.115 119.476L170.893 157.471C169.121 159.101 166.76 160.08 164.313 160.08C161.867 160.08 159.506 159.101 157.819 157.471L138.166 138.473C136.479 136.843 135.551 134.56 135.551 132.195C135.551 129.831 136.563 127.629 138.25 125.917C140.021 124.286 142.299 123.39 144.745 123.308C147.191 123.308 149.468 124.205 151.24 125.836L164.313 138.473L197.041 106.838C198.812 105.208 201.089 104.311 203.535 104.311C205.981 104.392 208.259 105.289 210.03 107.001C211.717 108.632 212.729 110.833 212.729 113.198Z" fill="white" />
                            <defs>
                                <filter id="filter0_d_2656_789" x="93.8203" y="55.1704" width="160.64" height="160.639" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="3.29444" />
                                    <feGaussianBlur stdDeviation="2.19629" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2656_789" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2656_789" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_2656_789" x1="136.506" y1="9.11491" x2="154.736" y2="9.11491" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_2656_789" x1="75.5059" y1="228.212" x2="94.0577" y2="228.212" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_2656_789" x1="0" y1="4.43146" x2="8.86292" y2="4.43146" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_2656_789" x1="174.14" y1="45.3591" x2="174.14" y2="219.032" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#B9EA6A" />
                                    <stop offset="1" stop-color="#2C9993" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="text-[40px] font-bold text-[#101828] mb-2">Payment Successful</h1>
                    <p className="text-[18px] text-[#667085] mb-6">Thank you for your purchase! Your subscription is now active.</p>

                    <button className="flex items-center gap-2 text-[#2C9993] font-medium hover:underline cursor-pointer mb-12">
                        <Copy size={18} />
                        <span>Copy Receipt</span>
                    </button>

                    {/* Selected Plan Section */}
                    <div className="w-full flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <span className="text-[14px] text-[#667085] mb-1">Selected Plan</span>
                            <h2 className="text-[24px] font-bold text-[#101828]">Professional Plan</h2>
                        </div>
                        <div className="bg-[#ECFDF5] text-[#059669] px-4 py-1 rounded-full text-[14px] font-medium border border-[#A7F3D0]">
                            Active
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Billing Info */}
                        <div className="bg-inputBgColor rounded-[12px] p-8 space-y-4">
                            <h3 className="text-[18px] font-bold text-[#101828] mb-6">Billing Information</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#667085]">Amount Paid</span>
                                <span className="text-[16px] font-bold text-[#101828]">$49.00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#667085]">Payment Method</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] text-[#101828] font-medium">•••• 4242</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#667085]">Transaction ID</span>
                                <span className="text-[14px] text-[#101828] font-medium">TXN-2024-8472</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-bold text-[#101828]">Next Billing Date</span>
                                <span className="text-[16px] font-bold text-[#2C9993]">March 15, 2025</span>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="bg-inputBgColor rounded-[12px] p-8">
                            <ul className="grid grid-cols-1 gap-y-4">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-x-3">
                                        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                                            <Check size={20} className="text-[#2C9993]" />
                                        </div>
                                        <span className="text-[16px] text-[#475467]">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex items-center justify-end gap-6">
                        <button className="flex items-center gap-2 px-8 py-3 rounded-xl border border-[#E2E8F0] bg-[#F2F4F7] text-[#101828] font-bold text-[18px] hover:bg-[#E2E8F0] transition-all cursor-pointer">
                            <FileText size={20} />
                            <span>View Invoice</span>
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2C9993] text-white font-bold text-[18px] hover:bg-[#237c76] shadow-lg shadow-[#2c9993]/20 transition-all cursor-pointer"
                        >
                            <span>Go to Dashboard</span>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PaymentSuccessPage;