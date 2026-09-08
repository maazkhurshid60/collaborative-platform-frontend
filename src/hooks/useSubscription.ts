import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useSubscription = () => {
  const userDetails = useSelector(
    (state: RootState) => state.LoginUserDetail?.userDetails,
  );
  const user = userDetails?.user;
  const subscription = user?.subscription;
  const role = user?.role;

  // Return safe defaults if user data not loaded yet
  if (!user) {
    return {
      subscription: null,
      isTrialActive: false,
      isSubscriptionActive: false,
      hasAccess: true, // Allow access until data loads
      plan: "STANDARD",
      status: "ACTIVE",
      daysUntilTrialEnd: 0,
      canUsePremiumFeature: true, // Allow access until data loads
      role: undefined,
    };
  }

  const isTrialActive = () => {
    if (!subscription) return false;
    if (subscription.status !== "TRIALING") return false;
    return true;
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;

    // CANCELED subscriptions should NOT have access
    if (subscription.status === "CANCELED") return false;

    const active = subscription.status === "ACTIVE";
    const trialActive = isTrialActive();
    return active || trialActive;
  };

  const hasAccessResult = () => {
    // Only providers are restricted by subscription
    if (role !== "provider") return true;

    // Explicitly deny access for canceled subscriptions
    if (subscription?.status === "CANCELED") {
      console.log("⛔ Access denied: Subscription is CANCELED");
      return false;
    }

    const active = isSubscriptionActive();
    console.log(
      `🔍 hasAccess check: Role=${role}, Status=${subscription?.status}, Active=${active}`,
    );
    return active;
  };

  const daysUntilTrialEnd = () => {
    if (!subscription || !subscription.trialEnd) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diff = trialEnd.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Still inside the 3-day trial window where premium, time-limited features
  // (calling, voice messaging) are unlocked — distinct from isTrialActive,
  // which just checks the subscription STATUS and never expires on its own.
  const isWithinTrialFeatureWindow = () => {
    if (!subscription || subscription.status !== "TRIALING" || !subscription.trialEnd) {
      return false;
    }
    return new Date() <= new Date(subscription.trialEnd);
  };

  const result = {
    subscription,
    isTrialActive: isTrialActive(),
    isSubscriptionActive: isSubscriptionActive(),
    hasAccess: hasAccessResult(),
    plan: subscription?.plan || "STANDARD",
    status: subscription?.status || "ACTIVE",
    daysUntilTrialEnd: daysUntilTrialEnd(),
    // Gate for calling / voice messaging: paid access always passes; trial
    // accounts only pass for the first 3 days (see isWithinTrialFeatureWindow).
    canUsePremiumFeature: isSubscriptionActive() ? true : isWithinTrialFeatureWindow(),
    role,
  };

  return result;
};
