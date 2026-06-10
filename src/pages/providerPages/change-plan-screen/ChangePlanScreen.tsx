import { useState } from "react";
import { useSelector } from "react-redux";

import { Calendar, Crown, DollarSign, RefreshCcw } from "lucide-react";

import { RootState } from "../../../redux/store";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import { formatDate } from "@/utils/dataTimeUtils";
import PricingSectionSection from "./PricingSection";

function ChangePlanScreen() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );

  // Get user subscription data from Redux
  const userSubscription = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.user.subscription,
  );

  const currentPlan = userSubscription?.plan || "STANDARD";
  const subscriptionStatus = userSubscription?.status || "ACTIVE";
  const isTrialing = subscriptionStatus === "TRIALING";

  const plans = [
    {
      name: "Standard",
      description: "Perfect for startups and small teams",
      monthlyPrice: 9.99,
      annualPrice: 95.9,
      features: [
        billingCycle === "monthly" ? "Up to 100 Clients" : "Up to 1000 Clients",
        "Provider to Provider Communication",
        "Invite Providers to Platfrom",
        "Participate in Group Chat",
        "Add Your Client To Platform",
        "Share Documents with Clients",
        "Basic Invoicing & Billing",
        "Start a New Group Chat",
        "Add others Providers Client To Your Profile",
      ],
      isActive: currentPlan === "STANDARD", // Dynamic from backend
      isPopular: false,
      theme: "basic",
    },
    {
      name: "Pro",
      description: "Best for growing businesses",
      monthlyPrice: 79,
      annualPrice: 63,
      features: [
        "Up to 1,000 Clients",
        "Advanced invoicing & automation",
        "Priority support 24/7",
        "Multi-currency support",
        "Advanced analytics & reports",
        "API access & integrations",
        "Team collaboration tools",
      ],
      isActive: currentPlan === "PRO",
      isPopular: true,
      theme: "pro",
      comingSoon: true,
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
        "Advanced security & compliance",
      ],
      isActive: false,
      isPopular: false,
      theme: "enterprise",
      comingSoon: true,
    },
  ];

  // Get the active plan's price based on plan name and billing cycle
  const getActivePlanPrice = () => {
    const plan = plans.find((p) => p.name.toUpperCase() === currentPlan);
    if (!plan) return "-";
    return userSubscription?.billingCycle === "YEARLY"
      ? plan.annualPrice
      : plan.monthlyPrice;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <OutletLayout heading="Change Subscription Plan">
        <p className="text-[20px] font-medium text-[#666666] -mt-8.75">
          Manage your subscription and billing preferences
        </p>

        {/* Current Plan Summary (Upper Section) */}
        <div className="w-full bg-[#D1FAE5]/50 rounded-2xl p-8.25 mt-2">
          <div className="flex items-center justify-between">
            <div className="w-full flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <p className="text-[24px] font-semibold text-[#101828] font-[Poppins]">
                  Your Current Plan
                </p>
                <div
                  className={`px-4 py-1 rounded-full flex items-center justify-center ${
                    isTrialing
                      ? "bg-[#FFA500]"
                      : subscriptionStatus === "ACTIVE"
                        ? "bg-[#2ACF27]"
                        : "bg-gray-400"
                  }`}
                >
                  <p className="text-[14px] font-medium text-[#FFFFFF] font-[Poppins]">
                    {isTrialing ? "Free Version" : subscriptionStatus}
                  </p>
                </div>
              </div>
              <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">
                {isTrialing
                  ? `Free Version - limited access to features`
                  : `${currentPlan} Plan - Full access to all premium features`}
              </p>
            </div>
            <div className="w-16 h-16 bg-[#FFFFFF] rounded-2xl flex items-center justify-center shadow-sm">
              <Crown className="w-8 h-8 text-[#2C9993]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="w-11 h-11 bg-[#CCD1FB] rounded-lg flex items-center justify-center text-[#2835A0]">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-[#666666] font-[Poppins]">
                  {isTrialing ? "Next Billing Date" : "Next Billing Date"}
                </p>
                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                  {isTrialing
                    ? "-"
                    : formatDate(
                        userSubscription?.currentPeriodEnd ||
                          userSubscription?.trialEnd,
                      )}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="w-11 h-11 bg-[#D1FAE5] rounded-lg flex items-center justify-center text-[#2ACF27]">
                <RefreshCcw size={24} />
              </div>
              <div>
                <p className="text-sm text-[#666666] font-[Poppins]">
                  Billing Cycle
                </p>
                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                  {isTrialing
                    ? "Free Version"
                    : userSubscription?.billingCycle === "YEARLY"
                      ? "Yearly"
                      : "Monthly"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="w-11 h-11 bg-[#FEDAC7] rounded-lg flex items-center justify-center text-[#F97316]">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-[#666666] font-[Poppins]">Amount</p>
                <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                  {isTrialing
                    ? "Free"
                    : `$${getActivePlanPrice()}/${userSubscription?.billingCycle === "YEARLY" ? "year" : "month"}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </OutletLayout>

      {/* Pricing Selection Section */}
      <PricingSectionSection
        plans={plans}
        getActivePlanPrice={getActivePlanPrice}
      />
    </div>
  );
}

export default ChangePlanScreen;
