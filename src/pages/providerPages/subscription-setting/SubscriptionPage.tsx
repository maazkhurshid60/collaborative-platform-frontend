import { useState } from "react";
import { Calendar, Check, DollarSign, RefreshCcw, Repeat } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import CancelSubscriptionModal from "../../../components/modals/providerModal/cancel-subscription/CancelSubscriptionModal";
import { RootState } from "../../../redux/store";
import { subscriptionApiService } from "../../../services/subscriptionApiService";
import { useSubscription } from "../../../hooks/useSubscription";
import SubscriptionBillingHistory from "./SubscriptonBillingHistory";
import { formatDate } from "@/utils/dataTimeUtils";

export const SubscriptionSettingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get user and subscription data from Redux
  const user = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.user,
  );
  const userEmail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.email,
  );
  const userSubscription = user?.subscription;

  const { isTrialActive: isTrialing } = useSubscription();

  const currentPlanName = userSubscription?.plan || "STANDARD";
  const subscriptionStatus = userSubscription?.status || "ACTIVE";

  const plans = [
    {
      name: "Free Version",
      description: "Free version limited access",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Up to 100 Clients",
        "Provider to Provider Communication",
        "Invite Providers to Platfrom",
        "Can participate in group chats when invited, but cannot start new ones",
        "Add Your Client To Platform",
        "Share Documents with Clients",
        "Basic Invoicing & Billing",
      ],
      isActive: isTrialing,
      isPopular: false,
      theme: "basic",
    },
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
      isActive: currentPlanName === "STANDARD" && !isTrialing,
      isPopular: false,
      theme: "basic",
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
        "API access & integrations",
      ],
      isActive: currentPlanName === "PRO",
      isPopular: true,
      theme: "pro",
    },
  ];

  const activePlan = plans.find((p) => p.isActive) || plans[0];

  const { data: billingHistory } = useQuery({
    queryKey: ["payments"],
    queryFn: subscriptionApiService.getAllPayments,
  });

  // Raw payment objects from API (contain billTo, items etc. for invoice)
  const rawPayments: any[] = (billingHistory || []).filter(
    (p: any) => p.status === "paid",
  );

  const transformedHistory =
    rawPayments.map((payment: any) => ({
      id: payment.id,
      plan: payment.plan || "Standard",
      amount: payment.rawAmount
        ? `$${payment.rawAmount.toFixed(2)}`
        : payment.amount || "$0.00",
      date: formatDate(payment.createdAt || payment.date),
      status: payment.status || "Paid",
      _raw: payment,
    })) || [];

  const emailFromPayment = rawPayments[0]?.billTo?.email;
  const resolvedBillingEmail =
    userEmail && userEmail !== "-" && userEmail !== ""
      ? userEmail
      : emailFromPayment || "-";

  const subscriptionPageData = {
    title: "Subscription Overview",
    subtitle: "Manage your subscription and billing preferences",
    changePlanBtnText: "Change Plan",
    currentPlanSection: {
      title: `Your ${activePlan.name} Plan`,
      status: isTrialing
        ? "Free Version"
        : userSubscription?.cancelAtPeriodEnd
          ? "Active (Canceling)"
          : subscriptionStatus.charAt(0) +
            subscriptionStatus.slice(1).toLowerCase(),
      description: isTrialing
        ? "You are currently on the free version"
        : userSubscription?.cancelAtPeriodEnd
          ? `Your subscription will end on ${formatDate(userSubscription.currentPeriodEnd)}`
          : "Full access to all premium features",
      cancelBtnText: userSubscription?.cancelAtPeriodEnd
        ? "Scheduled"
        : "Cancel Plan",
    },

    nextBillingLabel: isTrialing ? "Trial Ends" : "Next Billing Date",
    billingCycleLabel: "Billing Cycle",
    amountDueLabel: "Current Rate",
  };

  const isAnnual = userSubscription?.billingCycle === "YEARLY";

  const subscriptionData = {
    activePlan: activePlan,
    nextBillingDate: formatDate(
      userSubscription?.currentPeriodEnd || userSubscription?.trialEnd,
    ),
    billingCycle: isAnnual
      ? "Yearly"
      : userSubscription?.currentPeriodEnd
        ? "Monthly"
        : "Free Version",
    amountDue: isTrialing
      ? "$0.00"
      : isAnnual
        ? `$${activePlan.annualPrice}/yr`
        : `$${activePlan.monthlyPrice}/mo`,
    billingEmail: resolvedBillingEmail,
    billingAddress: user?.address || "-",
    billingHistory: transformedHistory,
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div
        className={` bg-white relative  w-full p-3  pt-5 rounded-lg space-y-7
        font-[Poppins] text-textColor  pb-8.25
        `}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-y-1">
            <p className="headingMedium w-62.5 sm:w-100 ">
              {subscriptionPageData.title}
            </p>
            <p className="text-textColor/50">{subscriptionPageData.subtitle}</p>
          </div>
          <div className="w-auto">
            <button
              disabled={userSubscription?.status === "TRIALING"}
              onClick={() => navigate("/subscription/change-plan")}
              className={`px-4 h-10 flex items-center gap-x-2 justify-center rounded-[10px] border-2 border-[#2C9993] transition-all ${userSubscription?.status === "TRIALING" ? "opacity-50 cursor-not-allowed" : "text-[#2C9993] hover:bg-[#2C9993]/5 cursor-pointer"}`}
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
          <div className="flex flex-col items-start h-auto lg:h-170 gap-y-4  w-full lg:w-1/2 ">
            <div className="w-full h-full flex-1 bg-[#D1FAE5]/50 rounded-2xl  p-8.25 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-3">
                    <p className="text-[14px] font-semibold text-[#101828] font-[Poppins]">
                      {subscriptionPageData.currentPlanSection.title}
                    </p>
                    <div
                      className={`px-4 py-0.5 rounded-full flex items-center justify-center ${isTrialing ? "bg-[#FFA500]" : "bg-[#2ACF27]"}`}
                    >
                      <p className="text-[12px] font-medium text-[#FFFFFF] font-[Poppins] whitespace-nowrap">
                        {subscriptionPageData.currentPlanSection.status}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] font-normal text-[#666666] font-[Poppins]">
                    {subscriptionPageData.currentPlanSection.description}
                  </p>
                </div>
                <div className="flex items-center gap-x-4">
                  {isTrialing ? (
                    <button
                      onClick={() => navigate("/select-plan")}
                      className="px-4 h-10 border-2 rounded-[10px] transition-all border-[#2C9993] text-[#2C9993] hover:bg-[#2C9993]/5 cursor-pointer"
                    >
                      <span className="text-xs md:text-sm font-medium font-[Poppins]">
                        Upgrade Now
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled={userSubscription?.cancelAtPeriodEnd}
                      onClick={() => setIsCancelModalOpen(true)}
                      className={`px-4 h-10 border-2 rounded-[10px] transition-all ${userSubscription?.cancelAtPeriodEnd ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400" : "border-[#E21414] text-[#E21414] hover:bg-[#E21414]/5 cursor-pointer"}`}
                    >
                      <span className="text-xs md:text-sm font-medium font-[Poppins]">
                        <span className="hidden lg:inline">
                          {userSubscription?.cancelAtPeriodEnd
                            ? "Scheduled for Cancellation"
                            : "Cancel Subscription"}
                        </span>
                        <span className="inline lg:hidden">
                          {userSubscription?.cancelAtPeriodEnd
                            ? "Scheduled"
                            : "Cancel Plan"}
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
                {!isTrialing && (
                  <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                    <div className="w-11 h-11 bg-[#CCD1FB] rounded-lg flex items-center justify-center text-[#2835A0]">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-[#666666] font-[Poppins]">
                        {subscriptionPageData.nextBillingLabel}
                      </p>
                      <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                        {subscriptionData.nextBillingDate}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="w-11 h-11 bg-[#D1FAE5] rounded-lg flex items-center justify-center text-[#2ACF27]">
                    <RefreshCcw size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-[#666666] font-[Poppins]">
                      {subscriptionPageData.billingCycleLabel}
                    </p>
                    <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                      {subscriptionData.billingCycle}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="w-11 h-11 bg-[#FEDAC7] rounded-lg flex items-center justify-center text-[#F97316]">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-[#666666] font-[Poppins]">
                      {subscriptionPageData.amountDueLabel}
                    </p>
                    <p className="text-lg font-semibold text-[#101828] font-[Poppins]">
                      {subscriptionData.amountDue}
                    </p>
                  </div>
                </div>
              </div>
              {/* Features */}
              <div className={`  p-6 rounded-2xl  bg-white mt-5`}>
                <p className="text-[14px] font-semibold text-[#101828] mb-3">
                  {isTrialing ? "Included in your trial" : "What's included"}
                </p>
                <ul className="space-y-2">
                  {activePlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        <Check
                          size={18}
                          className={"text-[#059669]"}
                          strokeWidth={3}
                        />
                      </div>
                      <span className={`text-[14px] ${"text-[#101828]"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* 2nd div biling options */}
          <SubscriptionBillingHistory />
        </div>
      </div>
      {isCancelModalOpen && (
        <CancelSubscriptionModal onClose={() => setIsCancelModalOpen(false)} />
      )}
    </div>
  );
};
