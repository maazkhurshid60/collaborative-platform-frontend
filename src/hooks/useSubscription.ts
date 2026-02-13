import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useSubscription = () => {
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
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
            plan: 'STANDARD',
            status: 'ACTIVE',
            daysUntilTrialEnd: 0,
            role: undefined
        };
    }

    const isTrialActive = () => {
        if (!subscription) return false;
        if (subscription.status !== 'TRIALING') return false;

        if (!subscription.trialEnd) {
            if (subscription.trialStart) {
                const trialStart = new Date(subscription.trialStart);
                const now = new Date();
                const hoursSinceStart = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60);
                if (hoursSinceStart < 1) return true;
            }
            return true;
        }

        const now = new Date();
        const trialEnd = new Date(subscription.trialEnd);
        return now < trialEnd;
    };

    const isSubscriptionActive = () => {
        if (!subscription) return false;

        // CANCELED subscriptions should NOT have access
        if (subscription.status === 'CANCELED') return false;

        const active = subscription.status === 'ACTIVE';
        const trialActive = isTrialActive();
        return active || trialActive;
    };

    const hasAccessResult = () => {
        // Only providers are restricted by subscription
        if (role !== 'provider') return true;

        // Explicitly deny access for canceled subscriptions
        if (subscription?.status === 'CANCELED') {
            console.log("⛔ Access denied: Subscription is CANCELED");
            return false;
        }

        const active = isSubscriptionActive();
        console.log(`🔍 hasAccess check: Role=${role}, Status=${subscription?.status}, Active=${active}`);
        return active;
    };

    const daysUntilTrialEnd = () => {
        if (!subscription || !subscription.trialEnd) return 0;
        const now = new Date();
        const trialEnd = new Date(subscription.trialEnd);
        const diff = trialEnd.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const result = {
        subscription,
        isTrialActive: isTrialActive(),
        isSubscriptionActive: isSubscriptionActive(),
        hasAccess: hasAccessResult(),
        plan: subscription?.plan || 'STANDARD',
        status: subscription?.status || 'ACTIVE',
        daysUntilTrialEnd: daysUntilTrialEnd(),
        role
    };

    return result;
};
