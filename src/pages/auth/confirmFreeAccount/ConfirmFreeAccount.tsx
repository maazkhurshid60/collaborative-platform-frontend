import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import naclUtil from "tweetnacl-util";
import CryptoJS from "crypto-js";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";

import Loader from "../../../components/loader/Loader";
import StepIndicator from "../../../components/stepIndicator/StepIndicator";
import authService from "../../../apiServices/authApi/AuthApi";
import messageApiService from "../../../apiServices/chatApi/messagesApi/MessagesApi";
import confirmFreeAccount from "../../../../public/assets/confirm-free-account.png";
import { RootState } from "../../../redux/store";
import { emptyDataNewJoinUserReducer } from "../../../redux/slices/JoinNowUserSlice";
import {
  saveDecryptedPrivateKey,
  saveLoginUserDetailsReducer,
} from "../../../redux/slices/LoginUserDetailSlice";

const features = [
  "Up to 100 Clients",
  "Provider to Provider Communication",
  "Invite Providers to Platfrom",
  "Can participate in group chats when invited, but cannot start new ones",
  "Add Your Client To Platform",
  "Share Documents with Clients",
  "Basic Invoicing & Billing",
];

const ConfirmFreeAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation() as {
    state: { userData?: any; planType?: string; inviteToken?: string };
  };

  const joinUser = useSelector(
    (state: RootState) => state?.joinUserSlice?.data,
  );

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!location.state?.userData) {
        throw new Error("SESSION_EXPIRED");
      }

      const planType = location.state?.planType || "FREE";
      const signupData = {
        ...location.state.userData,
        planType,
      };

      return await authService.signup(signupData);
    },
    onSuccess: async (response) => {
      const token = response?.data?.token;
      const user = response?.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);

        // Decrypt Private Key if present
        const encryptedPrivateKey = user?.user?.privateKey;
        if (encryptedPrivateKey && location.state?.userData?.password) {
          try {
            const decryptedKeyString = CryptoJS.AES.decrypt(
              encryptedPrivateKey,
              location.state.userData.password,
            ).toString(CryptoJS.enc.Utf8);
            const decryptedPrivateKeyUint8 =
              naclUtil.decodeBase64(decryptedKeyString);
            const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8);
            dispatch(saveDecryptedPrivateKey(base64Key));
          } catch (_decryptError) {
            console.error("Failed to decrypt private key:", _decryptError);
          }
        }

        const fixedUserData = {
          ...user,
          clientList:
            user?.clientList?.map((item: any) => item.client) || [],
        };
        dispatch(saveLoginUserDetailsReducer(fixedUserData));
      }

      // Clear join user state if any
      if (joinUser?.isNewJoin) {
        try {
          await messageApiService.updateGroupApi({
            groupId: joinUser.groupId,
            memberEmail: joinUser.memberEmail,
          });
        } catch (_groupErr) {
          console.error("Failed to update group membership:", _groupErr);
        }
        dispatch(emptyDataNewJoinUserReducer());
      }

      toast.success("Free plan activated!");
      sessionStorage.setItem("kolabFreeTrialLead", "1");
      navigate("/welcome-free-trial");
    },
    onError: (error: any) => {
      if (error?.message === "SESSION_EXPIRED") {
        toast.error("Session expired. Please signup again.");
        navigate("/provider-signup");
        return;
      }

      if (error?.response?.status === 429) {
        toast.error("Too Many Request Please Try again later");
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.error ||
        "Failed to create account.";

      if (errorMessage.includes("already exists")) {
        toast.error("Account already exists. Please login.");
        navigate("/login");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleStartPlan = () => {
    signupMutation.mutate();
  };

  return (
    <>
      {signupMutation.isPending && <Loader />}
      <div className="flex min-h-screen items-stretch">
        {/* Left Side - Form Section */}
        <div className="w-full md:w-[60%] lg:w-1/2 flex flex-col items-center justify-center md:py-8 lg:py-15">
          <StepIndicator currentStep={2} totalSteps={2} />
          <div className="w-full md:w-[90%] lg:w-[70%] rounded-[20px] max-w-screen bg-white px-6 md:px-8 lg:px-14 py-4 md:drop-shadow-md">
            <p className="heading text-left mb-4 capitalize">
              Confirm Your Free Account
            </p>
            {/* Features */}
            <div className="mt-auto p-6 rounded-2xl bg-inputBgColor">
              <ul className="space-y-4">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <Check
                        size={18}
                        className="text-[#059669]"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-[14px] text-[#666666]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#FFFBEB] mt-4 w-full min-h-26.75 rounded-lg p-4 pt-6 flex flex-col">
              <div className="flex flex-row items-center align-middle gap-2">
                <Info size={24} className="text-[#D97706]" />
                <p className="text-[16px] font-medium text-[#78350F]">
                  Limited Features Included
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2 ml-6">
                <p className="text-[14px] font-normal text-[#78350F]">
                  Your free account includes basic features to get you started.
                  Upgrade anytime to unlock advanced capabilities.
                </p>
              </div>
            </div>
            <p className="text-[12px] mt-4 text-[#64748B] text-center max-w-112.5">
              By starting your free plan, you agree to our{" "}
              <a
                href="https://kolabme.com/terms-and-conditions"
                className="text-[#2C9993] hover:underline cursor-pointer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://kolabme.com/privacy-policy/"
                className="text-[#2C9993] hover:underline cursor-pointer"
              >
                Privacy Policy
              </a>
            </p>

            <div className="w-full mt-6 border border-[#E5E7EB]" />
            <p className="text-[18px] mt-4 text-[#333333] font-[Poppins] font-medium text-center max-w-112.5">
              Need more features for your team?
            </p>
            <button
              type="button"
              className="flex flex-row items-center justify-center gap-2 w-full mt-4 py-2"
              onClick={() =>
                navigate("/select-plan", {
                  state: {
                    userData: location.state?.userData,
                    inviteToken: location.state?.inviteToken,
                  },
                })
              }
            >
              <p className="text-[16px] font-medium font-[Poppins] text-[#2C9993] cursor-pointer">
                View Pricing Plans{" "}
              </p>
              <ArrowRight
                size={18}
                className="text-[#2C9993]"
                strokeWidth={3}
              />
            </button>
          </div>
          <div className="w-full md:w-[90%] lg:w-[70%] flex flex-row items-center mt-20 justify-between gap-x-2">
            <button
              type="button"
              className="flex flex-row items-center gap-2 border-[#2C9993] border text-[#2C9993] cursor-pointer hover:text-white hover:bg-[#2C9993] px-4 py-2 rounded-lg"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="text-inherit" strokeWidth={3} />
              Back
            </button>
            <button
              type="button"
              onClick={handleStartPlan}
              className="bg-[#2C9993] text-white cursor-pointer hover:bg-[#2C9993]/90 px-4 py-2 rounded-lg disabled:opacity-50"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending
                ? "Processing..."
                : location.state?.planType === "FREE"
                  ? "Start Free Plan"
                  : "Confirm Free Plan"}
            </button>
          </div>
        </div>

        {/* Right Side - Image Section */}
        <div className="hidden md:flex md:w-[40%] lg:w-1/2 bg-primaryColorLight items-center justify-center rounded-bl-[20px] rounded-tl-[20px]">
          <img
            src={confirmFreeAccount}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full max-h-screen object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default ConfirmFreeAccount;
