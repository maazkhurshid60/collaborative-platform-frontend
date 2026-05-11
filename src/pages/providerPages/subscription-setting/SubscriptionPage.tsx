import { ArrowRight, Calendar, Check, Crown, DollarSign, Download, FileText, Lock, RefreshCcw, Repeat, Search, SquarePen } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CancelSubscriptionModal from "../../../components/modals/providerModal/cancel-subscription/CancelSubscriptionModal";
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf";
import { AppDispatch, RootState } from "../../../redux/store";
import { useQuery } from "@tanstack/react-query";
import { subscriptionApiService } from "../../../services/subscriptionApiService";
import { useSubscription } from "../../../hooks/useSubscription";

export const SubscriptionSettingPage = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get user and subscription data from Redux
    const user = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user);
    const userEmail = useSelector((state: RootState) => state.LoginUserDetail.userDetails.email);
    const userSubscription = user?.subscription;

    // `useSubscription` does the proper trial check — it verifies both
    // `status === 'TRIALING'` AND that the trial-end date hasn't passed.
    // Using it here avoids a known foot-gun: when the redux store is loading
    // or the subscription hasn't been fetched yet, the local fallback
    // `subscription?.status || 'ACTIVE'` would mark a real trial user as
    // "Active" and accidentally label them as a paid Standard subscriber.
    const { isTrialActive: isTrialing, daysUntilTrialEnd } = useSubscription();

    const currentPlanName = userSubscription?.plan || 'STANDARD';
    const subscriptionStatus = userSubscription?.status || 'ACTIVE';

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
            name: "Free Trial",
            description: "14-day free trial limited access",
            monthlyPrice: 0,
            annualPrice: 0,
            features: [
                "Up to 100 Clients",
                "Provider to Provider Communication",
                "Invite Providers to Platfrom",
                "Can participate in group chats when invited, but cannot start new ones",
                "Add Your Client To Platform",
                "Share Documents with Clients",
                "Basic Invoicing & Billing"

            ],
            isActive: isTrialing,
            isPopular: false,
            theme: 'basic'
        },
        {
            name: "Standard",
            description: "Perfect for startups and small teams",
            monthlyPrice: 9.99,
            annualPrice: 95.90,
            features: [
                billingCycle === 'monthly' ? "Up to 100 Clients" : "Up to 1000 Clients",
                "Provider to Provider Communication",
                "Invite Providers to Platfrom",
                "Participate in Group Chat",
                "Add Your Client To Platform",
                "Share Documents with Clients",
                "Basic Invoicing & Billing",
                "Start a New Group Chat",
                "Add others Providers Client To Your Profile"
            ],
            isActive: currentPlanName === 'STANDARD' && !isTrialing,
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

    const { data: billingHistory, } = useQuery({
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
            cancelBtnText: userSubscription?.cancelAtPeriodEnd ? "Scheduled" : "Cancel Plan"
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
        amountDue: isTrialing ? "$0.00" : (isAnnual ? `$${activePlan.annualPrice}/yr` : `$${activePlan.monthlyPrice}/mo`),
        billingEmail: resolvedBillingEmail,
        billingAddress: user?.address || "-",
        billingHistory: transformedHistory
    };


    // Restrictions that apply during the free trial. These mirror what the
    // backend / UI actually enforce today (see Navbar add-existing-client gate
    // and the addExistingClientToProvider controller). Keep this list accurate
    // when new trial gates are introduced so users aren't surprised.
    const trialRestrictions = [
        "Adding clients created by other providers (collaboration is paid-only)",
        "Starting new group chats (you can still join when invited)",
    ];

    return (
        <div className="flex flex-col gap-6 pb-10">
            {/* Free-trial banner — only shown while the trial is active.
                Sits above everything else so the user can't miss the state. */}
            {/* {isTrialing && (
                <div className="rounded-[16px] border border-[#FFA500]/30 bg-gradient-to-r from-[#FFF7E6] to-[#FFFBF0] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFA500]/15 text-[#FFA500] flex items-center justify-center flex-shrink-0">
                            <Crown size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-[#101828] font-[Poppins]">
                                You're on the 14-day Free Trial
                                {daysUntilTrialEnd > 0 && (
                                    <span className="text-[#FFA500]"> · {daysUntilTrialEnd} day{daysUntilTrialEnd === 1 ? "" : "s"} left</span>
                                )}
                            </p>
                            <p className="text-[13px] text-[#666666] font-[Poppins] mt-0.5">
                                Your subscription will move to the {currentPlanName.charAt(0) + currentPlanName.slice(1).toLowerCase()} plan when the trial ends.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/select-plan')}
                        className="self-start md:self-center px-4 h-[40px] rounded-[10px] bg-[#2C9993] text-white text-[14px] font-medium font-[Poppins] hover:bg-[#2C9993]/90 transition-colors cursor-pointer flex-shrink-0"
                    >
                        Upgrade now
                    </button>
                </div>
            )} */}

            <div className={` bg-white relative  w-full p-3  pt-5 rounded-lg space-y-7
        font-[Poppins] text-textColor  pb-[33px]
        `}>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className='headingMedium w-[250px] sm:w-[400px] '>{subscriptionPageData.title}</p>
                        <p className='text-textColor/50'>{subscriptionPageData.subtitle}</p>

                    </div>
                    <div className='w-auto'>
                        <button
                            disabled={userSubscription?.status === 'TRIALING'}
                            onClick={() => navigate('/subscription/change-plan')}
                            className={`px-4 h-[40px] flex items-center gap-x-2 justify-center rounded-[10px] border-2 border-[#2C9993] transition-all ${userSubscription?.status === 'TRIALING' ? 'opacity-50 cursor-not-allowed' : 'text-[#2C9993] hover:bg-[#2C9993]/5 cursor-pointer'}`}
                        >
                            <Repeat className="w-4 h-4" />
                            <span className="text-[14px] font-medium font-[Poppins]">
                                <span className="hidden lg:inline">Change Subscription</span>
                                <span className="inline lg:hidden">Change Plan</span>
                            </span>
                        </button>
                    </div>

                </div>
                {/* Current Plan Summary (Upper Section) */}
                <div className="flex flex-col lg:flex-row items-stretch  justify-start gap-6">
                    <div className="flex flex-col items-start h-auto lg:h-[680px] gap-y-[16px]  w-full lg:w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#D1FAE5]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col items-start gap-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[14px] font-semibold text-[#101828] font-[Poppins]">{subscriptionPageData.currentPlanSection.title}</p>
                                        <div className={`px-4 py-0.5 rounded-full flex items-center justify-center ${isTrialing ? 'bg-[#FFA500]' : 'bg-[#2ACF27]'}`}>
                                            <p className="text-[12px] font-medium text-[#FFFFFF] font-[Poppins] whitespace-nowrap">{subscriptionPageData.currentPlanSection.status}</p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.currentPlanSection.description}</p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    {isTrialing ? (
                                        <button
                                            onClick={() => navigate('/select-plan')}
                                            className="px-4 h-[40px] border-2 rounded-[10px] transition-all border-[#2C9993] text-[#2C9993] hover:bg-[#2C9993]/5 cursor-pointer"
                                        >
                                            <span className="text-xs md:text-sm font-medium font-[Poppins]">
                                                Upgrade Now
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled={userSubscription?.cancelAtPeriodEnd}
                                            onClick={() => setIsCancelModalOpen(true)}
                                            className={`px-4 h-[40px] border-2 rounded-[10px] transition-all ${userSubscription?.cancelAtPeriodEnd ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' : 'border-[#E21414] text-[#E21414] hover:bg-[#E21414]/5 cursor-pointer'}`}
                                        >
                                            <span className="text-xs md:text-sm font-medium font-[Poppins]">
                                                <span className="hidden lg:inline">{userSubscription?.cancelAtPeriodEnd ? "Scheduled for Cancellation" : "Cancel Subscription"}</span>
                                                <span className="inline lg:hidden">{userSubscription?.cancelAtPeriodEnd ? "Scheduled" : "Cancel Plan"}</span>
                                            </span>
                                        </button>
                                    )}
                                    {/* <div className="w-12 h-12 bg-[#FFFFFF] rounded-[12px] flex items-center justify-center shadow-sm shrink-0">
                                        <Crown className="w-6 h-6 text-[#2C9993]" />
                                    </div> */}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
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
                                <p className="text-[14px] font-semibold text-[#101828] mb-3">
                                    {isTrialing ? "Included in your trial" : "What's included"}
                                </p>
                                <ul className="space-y-2">
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

                                {/* Trial restrictions — explicit list of what's locked
                                    during the trial. Keeps the user from being surprised
                                //     when the API rejects an "add existing client" call. */}
                                {/* {isTrialing && (
                                //     <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                                //         <p className="text-[14px] font-semibold text-[#101828] mb-3">
                                //             Locked during free trial
                                //         </p>
                                //         <ul className="space-y-3">
                                //             {trialRestrictions.map((restriction, i) => (
                                //                 <li key={i} className="flex items-start gap-3">
                                //                     <div className="mt-1 shrink-0 text-[#A0AEC0]">
                                //                         <Lock size={16} strokeWidth={2.5} />
                                //                     </div>
                                //                     <span className="text-[14px] text-[#666666]">
                                //                         {restriction}
                                //                     </span>
                                //                 </li>
                                //             ))}
                                //         </ul>
                                //     </div>
                                // ) */}

                            </div>
                        </div>

                    </div>
                    {/* 2nd div biling options */}
                    <div className="flex flex-col items-start h-auto lg:h-[680px] gap-y-[16px] w-full lg:w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#E5E7EB]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                                {subscriptionData.billingEmail && subscriptionData.billingEmail !== "-" && (
                                    <div className="w-full flex flex-col items-start justify-between gap-2">
                                        <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.billingInfoSection.emailTitle}</p>
                                        <p className="text-[16px] font-medium text-black font-[Poppins] truncate max-w-[150px] sm:max-w-[200px]" title={subscriptionData.billingEmail}>
                                            {subscriptionData.billingEmail.length > 20 ? `${subscriptionData.billingEmail.slice(0, 20)}...` : subscriptionData.billingEmail}
                                        </p>
                                    </div>
                                )}
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



