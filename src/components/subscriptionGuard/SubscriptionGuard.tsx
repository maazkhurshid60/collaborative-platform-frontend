import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import UpgradePrompt from '../upgradePrompt/UpgradePrompt';

interface SubscriptionGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    allowedPlans?: ('STANDARD')[];    // ('STANDARD' | 'PRO')[] - Pro plan disabled
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
    children,
    fallback,
    allowedPlans
}) => {
    const { hasAccess, plan } = useSubscription();

    // 1. Check if user has basic access (active/trialing)
    if (!hasAccess) {
        return <>{fallback || <UpgradePrompt message="Premium subscription required" showFullScreen={true} />}</>;
    }

    // 2. Check if specific plan is required (Standard vs Pro)
    if (allowedPlans && !allowedPlans.includes(plan as any)) {
        return <>{fallback || <UpgradePrompt message={`This feature requires a ${allowedPlans.join(' or ')} plan`} showFullScreen={true} />}</>;
    }

    return <>{children}</>;
};
