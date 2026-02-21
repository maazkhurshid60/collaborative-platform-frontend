import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useSubscriptionModals = () => {
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail.userDetails);
    const subscription = userDetails?.user?.subscription;

    /// state
    const [showPaymentOverdue, setShowPaymentOverdue] = useState(false);
    const [showSubscriptionExpired, setShowSubscriptionExpired] = useState(false);
    const [showTrialExpired, setShowTrialExpired] = useState(false);
    const [showRenewalSuccess, setShowRenewalSuccess] = useState(false);
    const [showSubscriptionCanceled, setShowSubscriptionCanceled] = useState(false);

    // Track last seen status so modals only fire when status actually CHANGES
    // (prevents modal re-appearing every time user navigates between pages)
    const lastStatusRef = useRef<string | null>(null);

    useEffect(() => {
        if (!subscription) return;

        const currentStatus = subscription.status;

        // Only re-evaluate modals if the status has actually changed
        if (currentStatus === lastStatusRef.current) return;
        lastStatusRef.current = currentStatus;

        // Show Payment Overdue modal for PAST_DUE status
        if (currentStatus === 'PAST_DUE') {
            setShowPaymentOverdue(true);
        } else {
            setShowPaymentOverdue(false);
        }

        // Show Subscription Canceled for CANCELED status (not pending cancellation)
        if (currentStatus === "CANCELED" && !subscription.cancelAtPeriodEnd) {
            setShowSubscriptionCanceled(true);
        } else {
            setShowSubscriptionCanceled(false);
        }

        // Show Trial Expired only when trial has actually ended
        if (currentStatus === "TRIALING" && subscription.trialEnd) {
            const trialEnd = new Date(subscription.trialEnd);
            const now = new Date();
            if (now > trialEnd) {
                setShowTrialExpired(true);
            }
        } else {
            setShowTrialExpired(false);
        }
    }, [subscription?.status]);


    return {
        showPaymentOverdue,
        setShowPaymentOverdue,
        showSubscriptionExpired,
        setShowSubscriptionExpired,
        showTrialExpired,
        setShowTrialExpired,
        showRenewalSuccess,
        setShowRenewalSuccess,
        showSubscriptionCanceled,
        setShowSubscriptionCanceled
    };
};