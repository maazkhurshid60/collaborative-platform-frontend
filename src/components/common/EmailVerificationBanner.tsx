import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-toastify';
import { AlertCircle, Mail, RotateCw } from 'lucide-react';
import authApiService from '../../apiServices/authApi/AuthApi';

const EmailVerificationBanner: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  // If there's no user, the user IS verified, or they ARE NOT a provider, don't show the banner.
  if (!userDetails?.user || userDetails.user.isEmailVerified || userDetails.user.role !== 'provider') {
    return null;
  }

  const handleResendLink = async () => {
    try {
      setIsSending(true);
      const response = await authApiService.resendVerification();

      if (response?.success) {
        toast.success("We've sent a new verification link to your email address. It will expire in 24 hours.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong while sending the email. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-sm relative z-50">
      <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between  h-full gap-3">
        <div className="flex items-center text-amber-800">
          <AlertCircle className="w-5 h-5 mr-2 text-amber-600 shrink-0" />
          <p className="font-medium">
            Please Verify Your Email Address!
          </p>
        </div>

        <button
          onClick={handleResendLink}
          disabled={isSending}
          className="flex items-center whitespace-nowrap cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-4 rounded-full transition-colors duration-200 disabled:opacity-50"
        >
          {isSending ? (
            <RotateCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-2" />
          )}
          {isSending ? "Sending..." : "Resend Link"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
