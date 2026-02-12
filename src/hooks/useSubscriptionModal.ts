import { useState, useEffect } from "react";
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


    useEffect(() => {
        if (!subscription) {
            return;
        }

        // Show Payment Overdue modal for PAST_DUE status
        if (subscription.status === 'PAST_DUE') {
            setShowPaymentOverdue(true);
        }

        // Show Subscription Expired for CANCELED status (not pending cancellation)
        if (subscription.status === "CANCELED" && !subscription.cancelAtPeriodEnd) {
            setShowSubscriptionExpired(true);
        }

        // Show Trial Expired only when trial has ended
        if (subscription.status === "TRIALING" && subscription.trialEnd) {
            const trialEnd = new Date(subscription.trialEnd);
            const now = new Date();
            if (now > trialEnd) {
                setShowTrialExpired(true);
            }
        }
    }, [subscription])


    return {
        showPaymentOverdue,
        setShowPaymentOverdue,
        showSubscriptionExpired,
        setShowSubscriptionExpired,
        showTrialExpired,
        setShowTrialExpired,
        showRenewalSuccess,
        setShowRenewalSuccess,


    }
}