import { ArrowRight, Calendar, Check, Crown, DollarSign, RefreshCcw } from "lucide-react";
import { useState } from "react";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";

export default function ChangePlanScreen() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

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

    return (
        <div className="flex flex-col gap-6 pb-10">
            <OutletLayout heading="Change Subscription Plan">
                <p className="text-[20px] font-medium text-[#666666] mt-[-35px]">Manage your subscription and billing preferences</p>

                {/* Current Plan Summary (Upper Section) */}
                <div className="w-full bg-[#D1FAE5]/50 rounded-[16px] p-[33px] mt-2">
                    <div className="flex items-center justify-between">
                        <div className="w-full flex flex-col items-start gap-2">
                            <div className="flex items-center gap-3">
                                <p className="text-[24px] font-semibold text-[#101828] font-[Poppins]">Your Current Plan</p>
                                <div className="px-4 py-1 bg-[#2ACF27] rounded-full flex items-center justify-center">
                                    <p className="text-[14px] font-medium text-[#FFFFFF] font-[Poppins]">Active</p>
                                </div>
                            </div>
                            <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">Full access to all premium features</p>
                        </div>
                        <div className="w-[64px] h-[64px] bg-[#FFFFFF] rounded-[16px] flex items-center justify-center shadow-sm">
                            <Crown className="w-[32px] h-[32px] text-[#2C9993]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                            <div className="w-11 h-11 bg-[#CCD1FB] rounded-lg flex items-center justify-center text-[#2835A0]">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-[#666666] font-[Poppins]">Next Billing Date</p>
                                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">March 15, 2025</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                            <div className="w-11 h-11 bg-[#D1FAE5] rounded-lg flex items-center justify-center text-[#2ACF27]">
                                <RefreshCcw size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-[#666666] font-[Poppins]">Billing Cycle</p>
                                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">Monthly</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[12px] p-5 flex flex-col gap-3 shadow-sm">
                            <div className="w-11 h-11 bg-[#FEDAC7] rounded-lg flex items-center justify-center text-[#F97316]">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-[#666666] font-[Poppins]">Amount Due</p>
                                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">$100/month</p>
                            </div>
                        </div>
                    </div>
                </div>
            </OutletLayout>

            {/* Pricing Selection Section */}

            <div className="px-[30px] flex flex-col items-center bg-white pt-4 rounded-2xl pb-[44px]">
                <h2 className="text-[32px] font-semibold text-[#101828] font-[Poppins] self-start mb-8">Ready to Change Your Plan?</h2>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E2E2] rounded-[8px] mb-12">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-2.5 rounded-[6px] text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[#2C9993] text-white shadow-sm' : 'text-[#7E7D83] hover:text-[#101828]'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('annually')}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-[6px] text-sm font-medium transition-all ${billingCycle === 'annually' ? 'bg-[#2C9993] text-white shadow-sm' : 'text-[#7E7D83] hover:text-[#101828]'}`}
                    >
                        Annually
                        <span className={`px-2 py-0.5 text-[12px] rounded-md ${billingCycle === 'annually' ? 'bg-white/20 text-white' : 'bg-[#ECFDF5] text-[#2C9993]'}`}>Save 20%</span>
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-[20px] transition-all duration-300 ${plan.theme === 'pro'
                                ? 'bg-[#2C9993] text-white shadow-xl scale-105 z-10'
                                : 'bg-white border border-[#border] text-[#101828] shadow-md'
                                } ${plan.isActive ? 'border-2 border-[#2ACF27]' : ''}`}
                        >
                            {/* Badges */}
                            {plan.isActive && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 py-1 px-8 bg-[#2ACF27] rounded-full text-white text-sm font-semibold">
                                    Active
                                </div>
                            )}
                            {plan.isPopular && (
                                <div className={`absolute -top-4   left-1/2 -translate-x-1/2 py-1.5 px-6 bg-white  border-2 border-[#2C9993] rounded-full text-[#2C9993] text-sm font-semibold shadow-sm`}>
                                    Most Popular
                                </div>
                            )}

                            {/* Plan Info */}
                            <div className="mb-6">
                                <h3 className={`text-[28px] font-bold mb-1 ${plan.theme === 'pro' ? 'text-white' : 'text-[#101828]'}`}>{plan.name}</h3>
                                <p className={`text-[15px] ${plan.theme === 'pro' ? 'text-white/80' : 'text-[#666666]'}`}>{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-8 flex items-baseline">
                                <span className={`text-[48px] font-bold relative ${plan.theme === 'pro' ? 'text-white' : 'text-[#101828]'}`}>
                                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                                </span>
                                <span className={`ml-2 text-[18px] absolute top-38 left-28 ${plan.theme === "enterprise" ? "absolute top-38 left-35" : ""} -translate-y-1/2 right-0 ${plan.theme === 'pro' ? 'text-white/80' : 'text-[#666666]'}`}>/mo</span>
                            </div>

                            {/* Action Button */}
                            {!plan.isActive && (
                                <button className={`w-full py-3.5 rounded-[12px] font-semibold text-lg mb-10 transition-all cursor-pointer ${plan.theme === 'pro'
                                    ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                                    : 'bg-white border-2 border-[#2C9993] text-[#2C9993] hover:bg-[#2C9993]/5'
                                    }`}>
                                    Get Started
                                </button>
                            )}
                            {plan.isActive && <div className="h-[60px] mb-10" />} {/* Spacer for active plan */}

                            {/* Features */}
                            <div className={`mt-auto p-6 rounded-[16px] ${plan.theme === 'pro' ? '' : 'bg-[#F0F2F3]'}`}>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 shrink-0">
                                                <Check size={18} className={plan.theme === 'pro' ? 'text-[#E5E7EB]' : 'text-[#059669]'} strokeWidth={3} />
                                            </div>
                                            <span className={`text-[14px] ${plan.theme === 'pro' ? 'text-[#E5E7EB]' : 'text-[#101828]'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-row justify-end items-end gap-x-2 mt-20 w-full">
                    <button className="w-[220px] h-[60px] border-[#2C9993]  border-2 flex items-center cursor-pointer justify-center rounded-[12px] text-[#2C9993] text-[18px] font-semibold">
                        Cancel
                    </button>
                    <button className="w-[220px] h-[60px] bg-[#2C9993] flex items-center cursor-pointer justify-center rounded-[12px] text-white text-[18px] font-semibold">
                        Confirm
                    </button>
                </div>

            </div>
        </div>
    );
}