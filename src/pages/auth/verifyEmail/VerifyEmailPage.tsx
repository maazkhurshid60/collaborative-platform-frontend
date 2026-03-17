import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authApiService from '../../../apiServices/authApi/AuthApi';
import { setEmailVerified } from '../../../redux/slices/LoginUserDetailSlice';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const hasCalledRef = React.useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasCalledRef.current) return;
      hasCalledRef.current = true;

      try {
        if (!token) return;

        const response = await authApiService.verifyEmail(token);

        if (response?.success) {
          setStatus('success');
          // Update Redux state so the banner disappears immediately
          dispatch(setEmailVerified(true));
          // Update local storage or trigger a refresh if the user is already logged in
          toast.success("Email verified successfully! You can now access all features.", {
            toastId: "verify-email-success" // Prevent duplicate toasts
          });
        }


      } catch (error: any) {
        if (error.response?.data?.message === "Email already verified") {
          dispatch(setEmailVerified(true));
          toast.info("You email is already verified");
          navigate("/dashboard");
          return;
        }
        setStatus('error');
        setErrorMessage(error.response?.data?.message || error.response?.data?.data?.error || "Invalid or expired verification link.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-[#00605A]">
          Identity Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-[#2cbdbc] animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Successfully Verified!</h3>
              <p className="text-gray-600 mb-8">Your email address has been verified. You now have full access to all Kolabme features.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center  cursor-pointer py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#2cbdbc] hover:bg-[#25a1a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2cbdbc] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-8">{errorMessage}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center cursor-pointer py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2cbdbc] transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
