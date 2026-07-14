import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { AlertCircle, Mail, RotateCw, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { RootState } from "../../redux/store";
import authApiService from "../../apiServices/authApi/AuthApi";

const EmailVerificationBanner: React.FC = () => {
  const userDetails = useSelector(
    (state: RootState) => state.LoginUserDetail?.userDetails,
  );

  const resendMutation = useMutation({
    mutationFn: async () => await authApiService.resendVerification(),
    onSuccess: (response) => {
      if (response?.success) {
        toast.success(
          response?.message ||
            "We've sent a new verification link to your email address. It will expire in 24 hours.",
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while sending the email. Please try again later.",
      );
    },
  });

  const isSending = resendMutation.isPending;
  const userId = userDetails?.user?.id;

  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (userId && typeof window !== "undefined") {
      const closed = sessionStorage.getItem(`emailVerificationBannerClosed_${userId}`);
      setIsClosed(!!closed);
    } else {
      setIsClosed(false);
    }
  }, [userId]);

  if (
    isClosed ||
    !userDetails?.user ||
    userDetails.user.isEmailVerified ||
    userDetails.user.role !== "provider"
  ) {
    return null;
  }

  const handleClose = () => {
    if (userId) {
      sessionStorage.setItem(`emailVerificationBannerClosed_${userId}`, "true");
      setIsClosed(true);
    }
  };

  const handleResendLink = () => {
    resendMutation.mutate();
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-sm relative z-50">
      <div className="w-full mx-auto flex  flex-row items-center justify-between  h-full gap-3">
        <div className="flex items-center text-amber-800">
          <AlertCircle className="w-5 h-5 mr-2 text-amber-600 shrink-0" />
          <p className="text-xs lg:text-sm font-medium">
            Please Verify Your Email Address!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleResendLink}
            disabled={isSending}
            className="flex items-center whitespace-nowrap cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-4 rounded-full transition-colors text-xs lg:text-sm duration-200 disabled:opacity-50"
          >
            {isSending ? (
              <RotateCw className="w-3 h-3 lg:w-4 lg:h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
            )}
            {isSending ? "Sending..." : "Resend Link"}
          </button>
          <button 
            onClick={handleClose}
            className="text-amber-600 hover:text-amber-800 transition-colors p-1"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
