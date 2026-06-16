import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import PlanExpiredOverlay from "../../../components/pagesComponent/dashboard/plan-expired/PlanExpiredOverlay";
import TrialExpiredModal from "../../../components/modals/TrialExpiredModal";

const Dashboard: React.FC = () => {
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Get subscription data from Redux
  const loginUserDetail = useSelector((state: any) => state?.LoginUserDetail);
  const subscription = loginUserDetail?.userDetails?.user?.subscription;

  // Check if trial/plan is expired
  useEffect(() => {
    if (!subscription) return;

    const isTrialExpired = () => {
      if (!subscription?.trailEnd) return false;

      const endDate = new Date(subscription.trailEnd);
      const today = new Date();

      // Trial expired if today is past end date
      return today > endDate;
    };

    const isPlanExpired = () => {
      // Check if subscription status is canceled/expired
      return (
        subscription?.status === "CANCELED" ||
        subscription?.status === "EXPIRED" ||
        subscription?.status === "PAST_DUE"
      );
    };

    // Show modal if trial or plan expired
    if (isTrialExpired() || isPlanExpired()) {
      setShowExpiredModal(true);
    }
  }, [subscription]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Your existing dashboard content */}
      <div className="max-w-330 mx-auto">
        <h1 className="text-[32px] font-bold text-[#101828] mb-6 font-[Poppins]">
          Your Statistics
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats content */}
        </div>

        {/* Show Premium Features Overlay if expired */}
        {(subscription?.status === "CANCELED" ||
          subscription?.status === "EXPIRED") && <PlanExpiredOverlay />}

        {/* Show Blocking Modal if trial expired */}
        {showExpiredModal && <TrialExpiredModal />}
      </div>
    </div>
  );
};

export default Dashboard;
