import { useNavigate } from "react-router-dom";
import { Check, Copy, FileText, LayoutDashboard, Search, ChevronDown, Loader2, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import authService from "../../apiServices/authApi/AuthApi";
import { saveLoginUserDetailsReducer } from "../../redux/slices/LoginUserDetailSlice";
import { subscriptionApiService } from "../../services/subscriptionApiService";
import InvoiceModal from "../../components/modals/InvoiceModal";
import { toast } from "react-toastify";

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");

    // Get user details from Redux
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
    const loginUserId = userDetails?.id;
    const role = userDetails?.user?.role;

    const [latestPayment, setLatestPayment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // 🔄 Force Sync and Refresh user data after payment
    useEffect(() => {
        const syncAndRefresh = async () => {
            if (!token || !loginUserId || !role) return;

            try {
                setIsLoading(true);

                // 1. Force Backend to Sync with Stripe (this saves currentPeriodEnd into DB)
                let syncSucceeded = false;
                try {
                    await subscriptionApiService.syncSubscription();
                    syncSucceeded = true;
                } catch (err: any) {
                    // Sync may fail for users whose subscription was just created — OK to continue
                }

                // 2. Fetch Latest Payment with retries — poll until we have real digits
                let payments: any[] = [];
                for (let i = 0; i < 6; i++) { // Increased retries
                    console.log(`[Diagnostic] Fetching payments attempt ${i + 1}`);
                    payments = await subscriptionApiService.getAllPayments();
                    const successfulPayment = payments?.find((p: any) => p.status === 'paid' || p.status === 'succeeded');

                    if (successfulPayment) {
                        const hasDigits = successfulPayment.last4 &&
                            successfulPayment.last4 !== '----' &&
                            successfulPayment.last4 !== '4242';

                        setLatestPayment(successfulPayment);

                        if (hasDigits) {
                            console.log(`[Diagnostic] Found valid digits: ${successfulPayment.last4}`);
                            break;
                        } else {
                            console.log(`[Diagnostic] Payment found but digits are still: ${successfulPayment.last4}`);
                        }
                    }
                    if (i < 5) await new Promise(resolve => setTimeout(resolve, 3000));
                }

                if (payments && payments.length > 0 && !latestPayment) {
                    setLatestPayment(payments[0]);
                }

                // 3. Refresh Redux data — poll getMe until currentPeriodEnd exists in DB
                let isUpdated = false;
                // If sync succeeded, fewer retries needed. If not, give webhook more time.
                const maxAttempts = syncSucceeded ? 4 : 8;
                for (let i = 0; i < maxAttempts; i++) {
                    const response = await authService.getMe(loginUserId, role);

                    if (response?.data?.data) {
                        const userData = response.data.data;
                        const periodEnd = userData?.user?.subscription?.currentPeriodEnd;

                        if (periodEnd) {
                            dispatch(saveLoginUserDetailsReducer(userData));
                            isUpdated = true;
                            break;
                        }
                    }
                    if (i < maxAttempts - 1) await new Promise(resolve => setTimeout(resolve, 3000));
                }

                // Fallback: save whatever data we have
                if (!isUpdated) {
                    const response = await authService.getMe(loginUserId, role);
                    if (response?.data?.data) {
                        dispatch(saveLoginUserDetailsReducer(response.data.data));
                    }
                }

            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        syncAndRefresh();
    }, [token, loginUserId, role, dispatch]);

    const features = [
        "Unlimited customers",
        "Custom billing workflows",
        "Dedicated account manager",
        "White-label options",
        "Custom integrations",
        "Advanced security & compliance"
    ];

    const handleCopyReceipt = () => {
        if (!latestPayment && !userDetails) {
            toast.error("Receipt data not ready yet");
            return;
        }

        const rawDate = userDetails?.user?.subscription?.currentPeriodEnd
            ? new Date(userDetails.user.subscription.currentPeriodEnd)
            : latestPayment?.dueDate
                ? new Date(latestPayment.dueDate)
                : null;
        const date = rawDate ? rawDate.toLocaleDateString() : "-";

        const receiptText = `
--------------------------
    PAYMENT RECEIPT
--------------------------
Plan: ${userDetails?.user?.subscription?.plan || "Standard"} Plan
Amount: ${latestPayment?.amount || "$0.00"}
Date: ${new Date().toLocaleDateString()}
Transaction ID: ${latestPayment?.invoiceNo || latestPayment?.id || "-"}
Payment Method: •••• ${latestPayment?.last4 || "-"}
Status: Paid
Next Billing: ${date}
--------------------------
Thank you for your purchase!
        `.trim();

        navigator.clipboard.writeText(receiptText)
            .then(() => toast.success("Receipt copied to clipboard!"))
            .catch(() => toast.error("Failed to copy receipt"));
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins]">


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

                    <button
                        onClick={handleCopyReceipt}
                        className="flex items-center gap-2 text-[#2C9993] font-medium hover:underline cursor-pointer mb-12"
                    >
                        <Copy size={18} />
                        <span>Copy Receipt</span>
                    </button>

                    {/* Selected Plan Section */}
                    <div className="w-full flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <span className="text-[14px] text-[#667085] mb-1">Selected Plan</span>
                            <h2 className="text-[24px] font-bold text-[#101828]">{userDetails?.user?.subscription?.plan || "Standard"} Plan</h2>
                        </div>
                        <div className="bg-[#ECFDF5] text-[#059669] px-4 py-1 rounded-full text-[14px] font-medium border border-[#A7F3D0]">
                            Active
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Billing Info */}
                        <div className="bg-inputBgColor rounded-[12px] p-8 space-y-4">
                            {
                                latestPayment ? (
                                    <div className="">


                                        <h3 className="text-[18px] font-bold text-[#101828] mb-6">Billing Information</h3>
                                        <div className="flex flex-col gap-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px] text-[#667085]">Amount Paid</span>
                                                <span className="text-[16px] font-bold text-[#101828]">{latestPayment?.amount || "$0.00"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px] text-[#667085]">Payment Method</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[14px] text-[#101828] font-medium">•••• {latestPayment?.last4 || "-"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px] text-[#667085]">Transaction ID</span>
                                                <span className="text-[14px] text-[#101828] font-medium">{latestPayment?.invoiceNo || latestPayment?.id || "-"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px] font-bold text-[#101828]">Next Billing Date</span>
                                                <span className="text-[16px] font-bold text-[#2C9993]">
                                                    {(() => {
                                                        const fromSub = userDetails?.user?.subscription?.currentPeriodEnd
                                                            ? new Date(userDetails.user.subscription.currentPeriodEnd)
                                                            : null;
                                                        const fromPayment = latestPayment?.dueDate
                                                            ? new Date(latestPayment.dueDate)
                                                            : null;
                                                        const date = fromSub || fromPayment;
                                                        return date
                                                            ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                            : "-";
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    <div className='flex items-center h-[200px] justify-center'>
                                        <Loader size={30} className="animate-spin" />
                                    </div>
                                )
                            }

                        </div>

                        {/* Features List */}
                        <div className="bg-inputBgColor rounded-[12px] p-8">
                            <div>
                                {
                                    latestPayment ? (
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
                                    ) : (
                                        <div className='flex items-center h-[200px] justify-center'>
                                            <Loader size={30} className="animate-spin" />
                                        </div>
                                    )
                                }
                            </div>

                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex items-center justify-end gap-6">
                        <button
                            onClick={() => setShowInvoiceModal(true)}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-[#E2E8F0] bg-[#F2F4F7] text-[#101828] font-bold text-[18px] hover:bg-[#E2E8F0] transition-all cursor-pointer"
                        >
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

            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                invoiceId={latestPayment?.id}
                invoiceData={latestPayment}
            />
        </div>
    );
};

export default PaymentSuccessPage;