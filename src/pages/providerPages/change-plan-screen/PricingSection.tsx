import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, RefreshCcw } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { RootState } from "@/redux/store";

interface PricingSectionSectionProps {
  plans: any;
  getActivePlanPrice: () => {};
}

const PricingSectionSection = ({
  plans,
  getActivePlanPrice,
}: PricingSectionSectionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );
  const navigate = useNavigate();
  const userSubscription = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.user.subscription,
  );
  const currentPlan = userSubscription?.plan || "STANDARD";

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan first");
      return;
    }

    const currentBillingCycle = userSubscription?.billingCycle || "MONTHLY";
    const newBillingCycle = billingCycle === "monthly" ? "MONTHLY" : "YEARLY";
    if (
      selectedPlan === currentPlan &&
      newBillingCycle === currentBillingCycle
    ) {
      toast.error("You are already on this plan and billing cycle");
      return;
    }

    navigate("/payment-checkout", {
      state: {
        planType: selectedPlan,
        billingCycle: billingCycle === "monthly" ? "MONTHLY" : "YEARLY",
        isUpgrade: true, // Flag to indicate this is an upgrade
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };
  return (
    <div className="px-7.5 flex flex-col items-center bg-white pt-4 rounded-2xl pb-11">
      <h2 className="text-[32px] font-semibold text-[#101828] font-[Poppins] self-start mb-8">
        Ready to Change Your Plan?
      </h2>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E2E2] rounded-lg mb-12">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-8 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all ${billingCycle === "monthly" ? "bg-[#2C9993] text-white shadow-sm" : "text-[#7E7D83] hover:text-[#101828]"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annually")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${billingCycle === "annually" ? "bg-[#2C9993] text-white shadow-sm" : "text-[#7E7D83] hover:text-[#101828]"}`}
        >
          Annually
          <span
            className={`px-2 py-0.5 text-[12px] text-[#306F11] rounded-md bg-green-200 `}
          >
            Save 20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full`}
      >
        {plans.map((plan: any) => (
          <div key={plan.name} className="relative">
            {/* Coming Soon overlay for Pro and Enterprise */}
            {(plan as any).comingSoon && (
              <div
                className="absolute inset-0 z-20 rounded-[20px] flex flex-col items-center justify-center"
                style={{
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  background: "rgba(255,255,255,0.55)",
                }}
              >
                <div className="bg-[#2C9993] text-white text-[13px] font-bold px-5 py-1.5 rounded-full shadow-md tracking-widest uppercase mb-2">
                  Coming Soon
                </div>
              </div>
            )}
            <div
              className={`relative flex flex-col p-8 rounded-[20px] transition-all duration-300 ${
                (plan as any).comingSoon
                  ? "pointer-events-none select-none"
                  : ""
              } ${
                plan.theme === "pro"
                  ? "bg-[#2C9993] text-white shadow-xl scale-105 z-10"
                  : "bg-white text-[#101828] shadow-md"
              } ${plan.isActive && plan.theme !== "pro" ? "border-2 border-[#2ACF27]" : plan.isActive ? "border-2 border-white" : "border border-[#E2E8F0]"} ${selectedPlan === plan.name.toUpperCase() ? "ring-4 ring-[#2C9993] ring-opacity-50" : ""}`}
            >
              {/* Badges */}
              {plan.isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 py-1 px-8 bg-[#2ACF27] rounded-full text-white text-sm font-semibold">
                  Active
                </div>
              )}
              {plan.isPopular && (
                <div
                  className={`absolute -top-4   left-1/2 -translate-x-1/2 py-1.5 px-6 bg-white  border-2 border-[#2C9993] rounded-full text-[#2C9993] text-sm font-semibold shadow-sm`}
                >
                  Most Popular
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-6">
                <h3
                  className={`text-[28px] font-bold mb-1 ${plan.theme === "pro" ? "text-white" : "text-[#101828]"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-[15px] ${plan.theme === "pro" ? "text-white/80" : "text-[#666666]"}`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline">
                <span
                  className={`text-[48px] font-bold relative ${plan.theme === "pro" ? "text-white" : "text-[#101828]"}`}
                >
                  $
                  {plan.isActive
                    ? getActivePlanPrice()
                    : billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.annualPrice}
                </span>
                <span
                  className={`ml-2 text-[18px] -translate-y-1/2 right-0 ${plan.theme === "pro" ? "text-white/80" : "text-[#666666]"}`}
                >
                  /{" "}
                  {plan.isActive
                    ? userSubscription?.billingCycle === "YEARLY"
                      ? "year"
                      : "month"
                    : billingCycle === "monthly"
                      ? "month"
                      : "year"}
                </span>
              </div>

              {/* Action Button */}
              {!plan.isActive && (
                <button
                  disabled={true}
                  onClick={() => setSelectedPlan(plan.name.toUpperCase())}
                  className={`w-full py-3.5 rounded-xl font-semibold text-lg mb-10 transition-all cursor-not-allowed ${
                    plan.theme === "pro"
                      ? "bg-transparent border-2 border-white text-white hover:bg-white/10"
                      : "bg-white border-2 border-[#2C9993] text-[#2C9993] hover:bg-[#2C9993]/5"
                  } ${selectedPlan === plan.name.toUpperCase() ? "bg-opacity-90 scale-95" : ""}`}
                >
                  {selectedPlan === plan.name.toUpperCase()
                    ? "Selected"
                    : "Coming Soon"}
                </button>
              )}
              {plan.isActive && (
                <div className="h-15 mb-10 flex items-center justify-center"></div>
              )}

              {/* Features */}
              <div
                className={`mt-auto p-6 rounded-2xl ${plan.theme === "pro" ? "" : "bg-inputBgColor"}`}
              >
                <ul className={` space-y-4`}>
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        <Check
                          size={18}
                          className={
                            plan.theme === "pro"
                              ? "text-[#E5E7EB]"
                              : "text-[#059669]"
                          }
                          strokeWidth={3}
                        />
                      </div>
                      <span
                        className={`text-[14px] ${plan.theme === "pro" ? "text-[#E5E7EB]" : "text-[#101828]"}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-end items-end gap-x-2 mt-20 w-full">
        <button
          onClick={handleCancel}
          className="w-55 h-15 border-[#2C9993] border-2 flex items-center cursor-pointer justify-center rounded-xl text-[#2C9993] text-[18px] font-semibold hover:bg-[#2C9993]/5 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmUpgrade}
          disabled={
            isLoading ||
            !selectedPlan ||
            (selectedPlan === currentPlan &&
              (billingCycle === "monthly" ? "MONTHLY" : "YEARLY") ===
                (userSubscription?.billingCycle || "MONTHLY"))
          }
          className="w-55 h-15 bg-[#2C9993] flex items-center cursor-pointer justify-center rounded-xl text-white text-[18px] font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCcw size={20} className="animate-spin" />
              Processing...
            </div>
          ) : (
            "Confirm"
          )}
        </button>
      </div>
    </div>
  );
};

export default PricingSectionSection;
