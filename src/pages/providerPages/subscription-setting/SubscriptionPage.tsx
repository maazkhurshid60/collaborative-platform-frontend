import { ArrowRight, Calendar, Check, Crown, DollarSign, Download, FileText, RefreshCcw, Repeat, Search, SquarePen } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CancelSubscriptionModal from "../../../components/modals/providerModal/cancel-subscription/CancelSubscriptionModal";
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf";
import { AppDispatch, RootState } from "../../../redux/store";
import { isCancelSubscriptionModalShowReducer } from "../../../redux/slices/ModalSlice";
import { useQuery } from "@tanstack/react-query";
import { subscriptionApiService } from "../../../services/subscriptionApiService";

export const SubscriptionSettingPage = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get user and subscription data from Redux
    const user = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user);
    const userEmail = useSelector((state: RootState) => state.LoginUserDetail.userDetails.email);
    const userSubscription = user?.subscription;

    const currentPlanName = userSubscription?.plan || 'STANDARD';
    const subscriptionStatus = userSubscription?.status || 'ACTIVE';
    const isTrialing = subscriptionStatus === 'TRIALING';

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const plans = [
        {
            name: "Standard",
            description: "Perfect for startups and small teams",
            monthlyPrice: 29,
            annualPrice: 278,
            features: [
                "Up to 100 customers",
                "Basic invoicing & billing",
                "Email support",
                "Payment processing",
                "Basic analytics",
                "Mobile app access"
            ],
            isActive: currentPlanName === 'STANDARD',
            isPopular: false,
            theme: 'basic'
        },
        {
            name: "Pro",
            description: "Best for growing businesses",
            monthlyPrice: 79,
            annualPrice: 756,
            features: [
                "Up to 1,000 customers",
                "Advanced invoicing & automation",
                "Priority support 24/7",
                "Multi-currency support",
                "Advanced analytics & reports",
                "API access & integrations"
            ],
            isActive: currentPlanName === 'PRO',
            isPopular: true,
            theme: 'pro'
        }
    ];

    const activePlan = plans.find(p => p.isActive) || plans[0];

    const { data: billingHistory, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['payments'],
        queryFn: subscriptionApiService.getAllPayments
    });

    // Raw payment objects from API (contain billTo, items etc. for invoice)
    const rawPayments: any[] = (billingHistory || []).filter((p: any) => p.status === 'paid');

    const transformedHistory = rawPayments.map((payment: any) => ({
        id: payment.id,
        plan: payment.plan || "Standard",
        amount: payment.rawAmount ? `$${payment.rawAmount.toFixed(2)}` : (payment.amount || "$0.00"),
        date: formatDate(payment.createdAt || payment.date),
        status: payment.status || "Paid",
        _raw: payment,
    })) || [];

    const emailFromPayment = rawPayments[0]?.billTo?.email;
    const resolvedBillingEmail = (userEmail && userEmail !== "-" && userEmail !== "")
        ? userEmail
        : (emailFromPayment || "-");

    const handleDownloadInvoice = async (payment: any) => {
        const raw = payment._raw || payment;
        const invoiceData = {
            invoiceNo: raw.invoiceNo || `INV-${raw.id?.split('-')[0]?.toUpperCase() || '0000'}`,
            date: raw.date || formatDate(raw.createdAt),
            dueDate: raw.dueDate || raw.date || formatDate(raw.createdAt),
            billTo: raw.billTo || {
                name: user?.fullName || "-",
                email: resolvedBillingEmail,
                address: user?.address || "-",
                city: "-",
            },
            items: raw.items || [
                {
                    description: `${raw.plan || "Standard"} Plan`,
                    subtext: `Subscription`,
                    qty: "01",
                    price: raw.amount || "$0.00",
                    amount: raw.amount || "$0.00",
                    status: raw.status === "paid" ? "Paid" : "Pending",
                }
            ],
            subtotal: raw.subtotal || raw.amount || "$0.00",
            tax: raw.tax || "$0.00",
            total: raw.total || raw.amount || "$0.00",
            notes: raw.notes || "Thank you for your business!",
        };
        // Download directly — no modal
        await downloadInvoicePdf(invoiceData);
    };

    const subscriptionPageData = {
        title: "Subscription Overview",
        subtitle: "Manage your subscription and billing preferences",
        changePlanBtnText: "Change Plan",
        currentPlanSection: {
            title: `Your ${activePlan.name} Plan`,
            status: isTrialing
                ? 'Free Trial'
                : userSubscription?.cancelAtPeriodEnd
                    ? 'Active (Canceling)'
                    : subscriptionStatus.charAt(0) + subscriptionStatus.slice(1).toLowerCase(),
            description: isTrialing
                ? "You are currently on a 14-day free trial"
                : userSubscription?.cancelAtPeriodEnd
                    ? `Your subscription will end on ${formatDate(userSubscription.currentPeriodEnd)}`
                    : "Full access to all premium features",
            cancelBtnText: userSubscription?.cancelAtPeriodEnd ? "Scheduled for Cancellation" : "Cancel Subscription"
        },
        billingInfoSection: {
            emailTitle: "Billing Email",
            addressTitle: "Billing Address"
        },
        billingHistoryTitle: "Billing History",
        nextBillingLabel: isTrialing ? "Trial Ends" : "Next Billing Date",
        billingCycleLabel: "Billing Cycle",
        amountDueLabel: "Current Rate"
    };

    const isAnnual = userSubscription?.billingCycle === 'YEARLY';

    const subscriptionData = {
        activePlan: activePlan,
        nextBillingDate: formatDate(userSubscription?.currentPeriodEnd || userSubscription?.trialEnd),
        billingCycle: isAnnual ? "Yearly" : (userSubscription?.currentPeriodEnd ? "Monthly" : "Trial"),
        amountDue: isAnnual ? `$${activePlan.annualPrice}/yr` : `$${activePlan.monthlyPrice}/mo`,
        billingEmail: resolvedBillingEmail,
        billingAddress: user?.address || "-",
        billingHistory: transformedHistory
    };


    return (
        <div className="flex flex-col gap-6 pb-10">
            <div className={` bg-white relative  w-full p-3  pt-5 rounded-lg space-y-7   
        font-[Poppins] text-textColor  pb-[33px]
        `}>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className='headingMedium w-[250  px] sm:w-[400px] '>{subscriptionPageData.title}</p>
                        <p className='text-textColor/50'>{subscriptionPageData.subtitle}</p>

                    </div>
                    <div className='w-[170px]'>
                        <button
                            disabled={userSubscription?.status === 'TRIALING'}
                            onClick={() => navigate('/billing/change-plan')}
                            className={` ${userSubscription?.status === 'TRIALING' ? 'opacity-50  cursor-not-allowed hover:bg-none p-2   flex items-center gap-x-1.5 justify-center rounded-[10px] border-2 border-[#2C9993]' : ' text-white p-2   flex items-center gap-x-1.5 cursor-pointer hover:bg-[#2C9993]/10 justify-center rounded-[10px] border-2 border-[#2C9993]'}`} >
                            <Repeat className="w-[20px] h-[20px] text-[#2C9993]" />
                            <span className=" text-[15px] font-[Poppins] text-[#2C9993]">{subscriptionPageData.changePlanBtnText}</span>
                        </button>
                    </div>

                </div>
                {/* Current Plan Summary (Upper Section) */}
                <div className="flex flex-row items-stretch justify-start gap-x-[24px]">
                    <div className="flex flex-col items-start h-[610px] gap-y-[16px] w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#D1FAE5]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex items-center justify-between">
                                <div className="w-full flex flex-col items-start gap-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[14px] font-semibold text-[#101828] font-[Poppins]">{subscriptionPageData.currentPlanSection.title}</p>
                                        <div className={`px-4 py-1 rounded-full flex items-center justify-center ${isTrialing ? 'bg-[#FFA500]' : 'bg-[#2ACF27]'}`}>
                                            <p className="text-[14px] font-medium text-[#FFFFFF] font-[Poppins]">{subscriptionPageData.currentPlanSection.status}</p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.currentPlanSection.description}</p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <button
                                        disabled={userSubscription?.cancelAtPeriodEnd || userSubscription?.status === 'TRIALING'}
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className={`w-[170px] h-[46px] border-2 rounded-[10px] cursor-pointer   ${userSubscription?.cancelAtPeriodEnd || userSubscription?.status === 'TRIALING' ? 'opacity-50 cursor-none  border-gray-400' : 'hover:bg-[#E21414]/10 border-[#E21414]'}`}
                                    >
                                        <p className={`text-[14px] font-medium font-[Poppins] ${userSubscription?.cancelAtPeriodEnd || userSubscription?.status === 'TRIALING' ? 'text-gray-400' : 'text-[#E21414]'}`}>{subscriptionPageData.currentPlanSection.cancelBtnText}</p>
                                    </button>
                                    <div className="w-[64px] h-[64px] bg-[#FFFFFF] rounded-[16px] flex items-center justify-center shadow-sm">
                                        <Crown className="w-[32px] h-[32px] text-[#2C9993]" />
                                    </div>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                                <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                                    <div className="w-11 h-11 bg-[#CCD1FB] rounded-lg flex items-center justify-center text-[#2835A0]">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#666666] font-[Poppins]">{subscriptionPageData.nextBillingLabel}</p>
                                        <p className="text-lg font-semibold text-[#101828] font-[Poppins]">{subscriptionData.nextBillingDate}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                                    <div className="w-11 h-11 bg-[#D1FAE5] rounded-lg flex items-center justify-center text-[#2ACF27]">
                                        <RefreshCcw size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#666666] font-[Poppins]">{subscriptionPageData.billingCycleLabel}</p>
                                        <p className="text-lg font-semibold text-[#101828] font-[Poppins]">{subscriptionData.billingCycle}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                                    <div className="w-11 h-11 bg-[#FEDAC7] rounded-lg flex items-center justify-center text-[#F97316]">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#666666] font-[Poppins]">{subscriptionPageData.amountDueLabel}</p>
                                        <p className="text-lg font-semibold text-[#101828] font-[Poppins]">{subscriptionData.amountDue}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Features */}
                            <div className={`  p-6 rounded-[16px]  bg-white mt-5`}>
                                <ul className="space-y-4">
                                    {activePlan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 shrink-0">
                                                <Check size={18} className={'text-[#059669]'} strokeWidth={3} />
                                            </div>
                                            <span className={`text-[14px] ${'text-[#101828]'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                    {/* 2nd div biling options */}
                    <div className="flex flex-col items-start h-[610px] gap-y-[16px] w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#E5E7EB]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex  justify-between">
                                <div className="w-full flex flex-col items-start justify-between gap-2">
                                    <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.billingInfoSection.emailTitle}</p>
                                    <p className="text-[16px] font-medium text-black font-[Poppins] truncate max-w-[150px] sm:max-w-[200px]" title={subscriptionData.billingEmail}>
                                        {subscriptionData.billingEmail.length > 20 ? `${subscriptionData.billingEmail.slice(0, 20)}...` : subscriptionData.billingEmail}
                                    </p>
                                </div>
                                {/* 2nd div biling address */}
                                <div className="w-full flex flex-col items-start justify-between gap-2">
                                    <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.billingInfoSection.addressTitle}</p>
                                    <p className="text-[16px] font-medium text-black font-[Poppins]">{subscriptionData.billingAddress}</p>
                                </div>
                            </div>
                            <div className="w-full border border-[#E5E7EB]  mt-9" />
                            <p className="text-[16px] font-medium text-black font-[Poppins] mt-4">{subscriptionPageData.billingHistoryTitle}</p>
                            <div className="w-full flex flex-col gap-y-4 mt-5">
                                {subscriptionData.billingHistory.length > 0 ? (
                                    subscriptionData.billingHistory.slice(0, 3).map((history: any, index: number) => (
                                        <div key={index} className="w-full flex items-center justify-between bg-white rounded-[8px] p-[16px]">
                                            <div className="flex items-center justify-between gap-x-2">
                                                <SquarePen color="#2C9993" size={24} />
                                                <div className="flex flex-col items-start justify-between  ">
                                                    <p className="font-[Poppins] text-[16px] font-medium text-black" >{history.date}</p>
                                                    <p className="font-[Poppins] text-[14px] font-normal capitalize text-[#666666]" >{history?.plan}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-x-2">
                                                <Download
                                                    color="#2C9993"
                                                    size={24}
                                                    className="cursor-pointer hover:opacity-70 transition-opacity"
                                                    onClick={() => handleDownloadInvoice(history)}
                                                />
                                                <p className="font-[Releway] text-[20px] font-bold leading-1.5 text-black" >{history.amount}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                                        <div className="relative w-32 h-32 mb-6">
                                            {/* Outer Glow */}
                                            <div className="absolute inset-0 bg-[#2C9993]/5 rounded-full animate-pulse blur-xl" />

                                            {/* Circular Background */}
                                            <div className="absolute inset-0 bg-[#F0FDF4] rounded-full flex items-center justify-center shadow-inner">
                                                <FileText className="w-14 h-14 text-[#2C9993] opacity-80" />
                                            </div>

                                            {/* Floating Elements (GIF-like animations) */}
                                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center animate-bounce duration-3000">
                                                <Search className="w-5 h-5 text-[#2C9993]" />
                                            </div>
                                            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center animate-pulse">
                                                <span className="text-[#2C9993] text-[12px] font-bold">$</span>
                                            </div>
                                            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-[#2C9993] rounded-full border-2 border-white animate-[ping_3s_linear_infinite]" />
                                        </div>

                                        <h3 className="text-[20px] font-bold text-[#101828] mb-2 font-[Poppins]">No Billing History</h3>
                                        <p className="text-[16px] text-[#667085] max-w-[280px] font-normal font-[Poppins]">
                                            Once you start your subscription, your receipts and invoices will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                            {subscriptionData.billingHistory.length > 3 && (
                                <button onClick={() => navigate('/billing')} className="flex flex-row w-full items-center justify-center gap-x-2  cursor-pointer   mt-9">
                                    <p className="font-[Poppins] text-[16px] font-medium text-[#2C9993]">View Billing History</p>
                                    <ArrowRight color="#2C9993" size={24} />
                                </button>
                            )}

                        </div>
                    </div>
                </div>

            </div>
            {isCancelModalOpen && <CancelSubscriptionModal onClose={() => setIsCancelModalOpen(false)} />}
        </div >
    );
}