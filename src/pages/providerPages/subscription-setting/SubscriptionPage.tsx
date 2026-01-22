import { ArrowRight, Calendar, Check, Crown, DollarSign, Download, RefreshCcw, Repeat, SquarePen } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import CancelSubscriptionModal from "../../../components/modals/providerModal/cancel-subscription/CancelSubscriptionModal";
import { AppDispatch, RootState } from "../../../redux/store";
import { isCancelSubscriptionModalShowReducer } from "../../../redux/slices/ModalSlice";

export default function SubscriptionSettingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const dispatch = useDispatch<AppDispatch>();
    const { isCancelSubscriptionModal } = useSelector((state: RootState) => state.modalSlice);

    const plans = [
        {
            name: "Basic",
            description: "Perfect for startups and small teams",
            monthlyPrice: 29,
            annualPrice: 23,
            features: [
                "Up to 100 customers",
                "Basic invoicing & billing",
                "Email support",
                "Payment processing",
                "Basic analytics",
                "Mobile app access"
            ],
            isActive: true,
            isPopular: false,
            theme: 'basic'
        },
        {
            name: "Pro",
            description: "Best for growing businesses",
            monthlyPrice: 79,
            annualPrice: 63,
            features: [
                "Up to 1,000 customers",
                "Advanced invoicing & automation",
                "Priority support 24/7",
                "Multi-currency support",
                "Advanced analytics & reports",
                "API access & integrations",
                "API access & integrations"
            ],
            isActive: false,
            isPopular: true,
            theme: 'pro'
        },
        {
            name: "Enterprise",
            description: "For large-scale operations",
            monthlyPrice: 199,
            annualPrice: 159,
            features: [
                "Unlimited customers",
                "Custom billing workflows",
                "Dedicated account manager",
                "White-label options",
                "Custom integrations",
                "Advanced security & compliance"
            ],
            isActive: false,
            isPopular: false,
            theme: 'enterprise'
        }
    ];

    const subscriptionPageData = {
        title: "Subscription Overview",
        subtitle: "Manage your subscription and billing preferences",
        changePlanBtnText: "Change Plan",
        currentPlanSection: {
            title: "Your Current Plan",
            status: "Active",
            description: "Full access to all premium features",
            cancelBtnText: "Cancel Subscription"
        },
        billingInfoSection: {
            emailTitle: "Billing Email",
            addressTitle: "Billing Address"
        },
        billingHistoryTitle: "Billing History",
        nextBillingLabel: "Next Billing Date",
        billingCycleLabel: "Billing Cycle",
        amountDueLabel: "Amount Due",
        subscriptionData: {
            activePlan: plans.find(p => p.isActive) || plans[0],
            nextBillingDate: "March 15, 2025",
            billingCycle: "Monthly",
            amountDue: "$100/month",
            billingEmail: "john.doe@example.com",
            billingAddress: "123 Main Street, New York, NY 10001",
            billingHistory: [
                {
                    date: "February 15, 2025",
                    plan: "Pro Plan - Monthly",
                    amount: "$79.00"
                },
                {
                    date: "January 15, 2025",
                    plan: "Pro Plan - Monthly",
                    amount: "$79.00"
                },
                {
                    date: "December 15, 2024",
                    plan: "Pro Plan - Monthly",
                    amount: "$79.00"
                }
            ]
        }
    };

    const activePlan = subscriptionPageData.subscriptionData.activePlan;
    const subscriptionData = subscriptionPageData.subscriptionData;

    return (
        <div className="flex flex-col gap-6 pb-10">
            <div className={` bg-white relative  w-full p-3  pt-5 rounded-lg space-y-7   
        font-[Poppins] text-textColor  pb-[33px]
        `}>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className='headingMedium w-[150px] sm:w-[400px] '>{subscriptionPageData.title}</p>
                        <p className='text-textColor/50'>{subscriptionPageData.subtitle}</p>

                    </div>
                    <div className='w-[170px]'>
                        <button className=" text-white p-2 flex items-center gap-x-1.5 cursor-pointer hover:bg-[#2C9993]/10 justify-center rounded-[10px] border-2 border-[#2C9993]" >
                            <Repeat className="w-[20px] h-[20px] text-[#2C9993]" />
                            <span className=" text-[15px] font-[Poppins] text-[#2C9993]">{subscriptionPageData.changePlanBtnText}</span>
                        </button>
                    </div>

                </div>
                {/* Current Plan Summary (Upper Section) */}
                <div className="flex flex-row items-stretch justify-start gap-x-[24px]">
                    <div className="flex flex-col items-start gap-y-[16px] w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#D1FAE5]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex items-center justify-between">
                                <div className="w-full flex flex-col items-start gap-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[24px] font-semibold text-[#101828] font-[Poppins]">{subscriptionPageData.currentPlanSection.title}</p>
                                        <div className="px-4 py-1 bg-[#2ACF27] rounded-full flex items-center justify-center">
                                            <p className="text-[14px] font-medium text-[#FFFFFF] font-[Poppins]">{subscriptionPageData.currentPlanSection.status}</p>
                                        </div>
                                    </div>
                                    <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.currentPlanSection.description}</p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <button
                                        onClick={() => dispatch(isCancelSubscriptionModalShowReducer(true))}
                                        className='w-[195px] h-[46px] border-2 rounded-[10px]  hover:bg-[#E21414]/10 cursor-pointer border-[#E21414]'
                                    >
                                        <p className="text-[16px] font-medium text-[#E21414] font-[Poppins]">{subscriptionPageData.currentPlanSection.cancelBtnText}</p>
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
                                                <Check size={18} className={activePlan.theme === 'pro' ? 'text-[#E5E7EB]' : 'text-[#059669]'} strokeWidth={3} />
                                            </div>
                                            <span className={`text-[14px] ${activePlan.theme === 'pro' ? 'text-[#E5E7EB]' : 'text-[#101828]'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                    {/* 2nd div biling options */}
                    <div className="flex flex-col items-start gap-y-[16px] w-1/2 " >
                        <div className="w-full h-full flex-1 bg-[#E5E7EB]/50 rounded-[16px]  p-[33px] mt-2">
                            <div className="flex  justify-between">
                                <div className="w-full flex flex-col items-start justify-between gap-2">
                                    <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">{subscriptionPageData.billingInfoSection.emailTitle}</p>
                                    <p className="text-[16px] font-medium text-black font-[Poppins]">{subscriptionData.billingEmail}</p>
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
                                {subscriptionData.billingHistory.map((history, index) => (
                                    <div key={index} className="w-full flex items-center justify-between bg-white rounded-[8px] p-[16px]">
                                        <div className="flex items-center justify-between gap-x-2">
                                            <SquarePen color="#2C9993" size={24} />
                                            <div className="flex flex-col items-start justify-between  ">
                                                <p className="font-[Poppins] text-[16px] font-medium text-black" >{history.date}</p>
                                                <p className="font-[Poppins] text-[14px] font-normal text-[#666666]" >{history.plan}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-x-2">
                                            <Download color="#2C9993" size={24} className="cursor-pointer" />
                                            <p className="font-[Releway] text-[20px] font-bold leading-1.5 text-black" >{history.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="flex flex-row w-full items-center justify-center gap-x-2  cursor-pointer   mt-9">
                                <p className="font-[Poppins] text-[16px] font-medium text-[#2C9993]">View Billing History</p>
                                <ArrowRight color="#2C9993" size={24} />
                            </button>

                        </div>
                    </div>
                </div>

            </div>
            {isCancelSubscriptionModal && <CancelSubscriptionModal />}
        </div>
    );
}