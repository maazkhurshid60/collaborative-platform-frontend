import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Check } from 'lucide-react';
import StepIndicator from '../../components/stepIndicator/StepIndicator';
import { RootState } from '../../redux/store';

const SelectPlan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, inviteToken } = location.state || {};
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    // Get logged-in user to check trial history
    const loggedInUser = useSelector((state: RootState) =>
        state.LoginUserDetail?.userDetails?.user
    );

    // Detect if this is an upgrade scenario (user already logged in, coming from expired trial)
    // vs signup scenario (new user, has userData from signup form)
    const isUpgradeFlow = !userData;

    // Check if user already used their free trial (only relevant for logged-in users during upgrade)
    const hasUsedTrial = isUpgradeFlow ? (loggedInUser?.hasUsedFreeTrial || false) : false;
    const plans = [
        {
            name: 'Free Trial',
            monthlyPrice: '0',
            annualPrice: '0',
            description: '14-day free trial · No credit card required',
            // Only offer trial if user has NEVER had one
            // Show "Subscribe Now" if: upgrading OR already used trial before
            // Show "Start Trial" if: new signup AND never had trial
            buttonText: 'Start 14-Day Free Trial',
            features: [
                "Up to 100 Clients",
                "Provider to Provider Communication",
                "Invite Providers to Platfrom",
                "Can participate in group chats when invited, but cannot start new ones",
                "Add Your Client To Platform",
                "Share Documents with Clients",
                "Basic Invoicing & Billing"
            ],
            theme: 'default',
        },
        // {
        //     name: 'Pro',
        //     monthlyPrice: '79',
        //     annualPrice: '63', // Example: ~20% discount
        //     description: 'Best for growing businesses',
        //     buttonText: 'Get Started',
        //     features: [
        //         'Up to 1,000 customers',
        //         'Advanced invoicing & automation',
        //         'Priority support 24/7',
        //         'Multi-currency support',
        //         'Advanced analytics & reports',
        //         'API access & integrations',
        //     ],
        //     theme: 'pro',
        //     isPopular: true,
        // },

        {
            name: 'Standard',
            monthlyPrice: '9.99',
            annualPrice: '95.90',
            description: 'Best for small businesses',
            // Only offer trial if user has NEVER had one
            // Show "Subscribe Now" if: upgrading OR already used trial before
            // Show "Start Trial" if: new signup AND never had trial
            buttonText: 'Subscribe Now',
            features: [
                "Up to 1000 Clients",
                "Provider to Provider Communication",
                "Invite Providers to Platfrom",
                "Participate in Group Chat",
                "Add Your Client To Platform",
                "Share Documents with Clients",
                "Basic Invoicing & Billing",
                "Start a New Group Chat",
                "Add others Providers Client To Your Profile"
            ],
            theme: 'default',
        },

    ];
    return (
        <div className='w-full max-w-full min-h-screen bg-[#F9FAFB] flex flex-col'>
            {/* Only show step indicator during signup, not during upgrade */}
            {!isUpgradeFlow && (
                <div className='w-full mt-12 pl-50 pr-50 flex items-center justify-center'>
                    <StepIndicator currentStep={2} totalSteps={2} />
                </div>
            )}
            <div className=" flex flex-col items-center px-4 font-[Poppins]">

                <div className="w-full max-w-[1320px] flex flex-col">
                    {/* Main Content Area */}
                    <div className="flex flex-col items-center mt-4">
                        {/* Title & Description */}
                        <div className="text-center mb-10">
                            <h1 className="text-[40px] font-bold text-[#101828] mb-4">Choose the plan that best fits your practice</h1>
                            <p className="text-[#666666] max-w-[1000px] mx-auto text-[18px] leading-relaxed">
                                Transparent billing with no hidden fees. Start with a 14-day free trial. Continue with our standard plan.
                            </p>
                        </div>
                        {/* Billing Cycle Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E2E2] rounded-[8px] mb-16 shadow-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-10 py-2.5 rounded-[6px] text-sm font-medium transition-all cursor-pointer ${billingCycle === 'monthly' ? 'bg-[#2C9993] text-white shadow-sm' : 'text-[#7E7D83] hover:text-[#101828]'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annually')}
                                className={`flex items-center gap-2 px-8 py-2.5 rounded-[6px] text-sm font-medium transition-all cursor-pointer ${billingCycle === 'annually' ? 'bg-[#2C9993] text-white shadow-sm' : 'text-[#7E7D83] hover:text-[#101828]'}`}
                            >
                                Annually
                                <span className="px-2 py-0.5 text-[12px] rounded-md bg-[#EDF8E8] text-[#306F11]">Save 20%</span>
                            </button>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[900px] mb-20 px-5">
                            {plans
                                .filter(plan => !hasUsedTrial || plan.name !== 'Free Trial') // Hide Free Trial if used
                                .map((plan, index) => (
                                    <div
                                        key={index}
                                        className={`relative flex flex-col p-8 rounded-[24px] transition-all duration-300 w-full h-full min-h-[500px] ${plan.theme === 'pro'
                                            ? 'bg-[#2C9993] text-white shadow-md'
                                            : 'bg-white border border-[#E5E7EB] text-[#101828] shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {/* {plan.isPopular && (
                                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 py-2 px-6 bg-white border-2 border-[#2C9993] rounded-full text-[#2C9993] text-sm font-bold shadow-sm whitespace-nowrap`}>
                                            Most Popular
                                        </div>
                                    )} */}

                                        {/* Plan Info */}
                                        <div className="mb-4">
                                            <h3 className={`text-[24px] font-bold mb-0.5 ${plan.theme === 'pro' ? 'text-white' : 'text-[#101828]'}`}>
                                                {plan.name}
                                            </h3>
                                            <p className={`text-[13px] leading-tight ${plan.theme === 'pro' ? 'text-white/80' : 'text-[#666666]'}`}>
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4 flex items-baseline gap-1">
                                            <span className={`text-[42px] font-bold ${plan.theme === 'pro' ? 'text-white' : 'text-[#101828]'}`}>
                                                ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                                            </span>
                                            {plan.name !== 'Free Trial' && (
                                                <span className={`text-[16px] ${plan.theme === 'pro' ? 'text-white/80' : 'text-[#666666]'}`}>
                                                    {billingCycle === 'monthly' ? '/month' : '/year'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button

                                            onClick={() => {
                                                if (plan.name === 'Free Trial') {
                                                    navigate('/confirm-free-account', {
                                                        state: {
                                                            userData,
                                                            planType: 'FREE',
                                                            inviteToken, // ✅ preserve invite context
                                                        }
                                                    });
                                                } else if (plan.name === 'Standard') {
                                                    navigate('/payment-checkout', {
                                                        state: {
                                                            planType: 'STANDARD',
                                                            billingCycle: billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY',
                                                            userData,
                                                            isRenewal: hasUsedTrial,
                                                            inviteToken, // ✅ preserve invite context
                                                        }
                                                    });
                                                } else {
                                                    // Pro plan = always requires payment
                                                    navigate('/payment-checkout', {
                                                        state: {
                                                            planType: 'PRO',
                                                            billingCycle: billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY',
                                                            userData,
                                                            inviteToken, // ✅ preserve invite context
                                                        }
                                                    });
                                                }
                                            }}
                                            className={`w-full py-2.5 rounded-[10px] font-medium text-[16px] mb-6 transition-all cursor-pointer border-2 ${plan.theme === 'pro'
                                                ? 'bg-transparent border-white text-white hover:bg-white/10'
                                                : 'bg-white border-[#2C9993] text-[#2C9993] hover:bg-[#2C9993]/5'
                                                }`}
                                        >
                                            {plan.buttonText}
                                        </button>

                                        {/* Features List */}
                                        <div className={` mt-auto p-4 rounded-[16px] ${plan.theme === 'pro' ? '' : 'bg-inputBgColor'}`}>
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <div className="mt-1 shrink-0">
                                                            <Check
                                                                size={14}
                                                                className={plan.theme === 'pro' ? 'text-[#34D399]' : 'text-[#059669]'}
                                                                strokeWidth={3}
                                                            />
                                                        </div>
                                                        <span className={`text-[12px] leading-snug ${plan.theme === 'pro' ? 'text-[#E5E7EB]' : 'text-[#101828]'}`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Back Button Section */}
                        <div className="w-full flex justify-start mb-12 px-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 border-2 border-[#2C9993] text-[#2C9993] px-8 py-3 rounded-[12px] hover:bg-[#2C9993] hover:text-white transition-all cursor-pointer font-semibold shadow-sm"
                            >
                                <ArrowLeft size={20} strokeWidth={3} />
                                <span>Back</span>
                            </button>
                        </div>

                        {/* Footer Auth Link - Only show if not upgrading */}
                        {!isUpgradeFlow && (
                            <p className="text-[#64748B] text-[16px] mb-8">
                                Already have an account? 
                                <span
                                    onClick={() => navigate('/')}
                                    className="text-[#2C9993] font-bold underline cursor-pointer hover:text-[#238a84] transition-colors"
                                >
                                    Sign In
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectPlan;
