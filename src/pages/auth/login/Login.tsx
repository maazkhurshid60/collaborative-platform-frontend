import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import CryptoJS from "crypto-js";
import naclUtil from "tweetnacl-util";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import InputField from "../../../components/inputField/InputField";
import AuthLayout from "../../../layouts/authLayout/AuthLayout";
import { LoginSchema } from "../../../schema/authSchema/AuthSchema";
import Button from "../../../components/button/Button";
import { useNavigate } from "react-router-dom";
import authService from "../../../apiServices/authApi/AuthApi";
import { AppDispatch } from "../../../redux/store";
import {
  saveDecryptedPrivateKey,
  saveLoginUserDetailsReducer,
} from "../../../redux/slices/LoginUserDetailSlice";

import { Client } from "../../../types/providerType/ProviderType";
import Loader from "../../../components/loader/Loader";

type FormFields = z.infer<typeof LoginSchema>;

export interface ISigninData {
  email: string;
  password: string;
}
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFaUserId, setTwoFaUserId] = useState<string | null>(null);
  const [twoFaToken, setTwoFaToken] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(LoginSchema),
  });
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  //FUNCTIONS
  const loginFunction = useCallback(
    async (data: FormFields) => {
      setIsLoading(true);
      try {
        const response = await authService.login(data);

        if (response?.data?.require2FA) {
          setShow2FA(true);
          setTwoFaUserId(response.data.userId);
          setSavedPassword(data.password);
          toast.info(response.message || "Two-factor authentication required.");
          setIsLoading(false);
          return;
        }

        const userData = response?.data?.user;
        // if (userData?.user?.isApprove === "PENDING" && userData?.user?.role !== "provider") {
        //     toast.error("Your account has not been approved or verified by the super admin yet. Please contact with super admin");
        //     navigate("/");
        //     return;
        // }
        if (userData?.user?.isApprove === "REJECTED") {
          toast.error(
            "Your account has been rejected by the super admin. Please contact with super admin.",
          );
          navigate("/");
          return;
        }
        if (userData?.user?.status?.toLowerCase() !== "active") {
          toast.error(
            "Oops! Your account has been disabled. Contact with super admin.",
          );
          navigate("/");
          return;
        }

        const fixedUserData = {
          ...userData,
          clientList:
            userData?.clientList?.map((item: Client) => item.client) || [],
        };

        localStorage.setItem("token", response?.data?.token);
        const encryptedPrivateKey = userData?.user?.privateKey;

        if (encryptedPrivateKey) {
          const decryptedKeyString = CryptoJS.AES.decrypt(
            encryptedPrivateKey,
            data.password,
          ).toString(CryptoJS.enc.Utf8);
          const decryptedPrivateKeyUint8 =
            naclUtil.decodeBase64(decryptedKeyString);
          console.log("decryptedPrivateKeyUint8", decryptedPrivateKeyUint8);

          const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8); // Convert to string
          dispatch(saveDecryptedPrivateKey(base64Key));
        }

        dispatch(saveLoginUserDetailsReducer(fixedUserData));

        toast.success(response?.message);

        navigateToRoleDashboard(userData);
      } catch (error: any) {
        if (error?.response?.status === 429) {
          toast.error("Too Many Request Please Try again later");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.data?.error ||
            "Unexpected error occurred.";
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, navigate],
  );

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaToken) {
      toast.error("Please enter your 2FA token.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verify2FA(twoFaUserId!, twoFaToken, isRecoveryMode);
      
      const userData = response?.data?.user;
      
      if (userData?.user?.isApprove === "REJECTED") {
        toast.error(
          "Your account has been rejected by the super admin. Please contact with super admin.",
        );
        navigate("/");
        return;
      }
      if (userData?.user?.status?.toLowerCase() !== "active") {
        toast.error(
          "Oops! Your account has been disabled. Contact with super admin.",
        );
        navigate("/");
        return;
      }

      const fixedUserData = {
        ...userData,
        clientList:
          userData?.clientList?.map((item: Client) => item.client) || [],
      };

      localStorage.setItem("token", response?.data?.token);
      const encryptedPrivateKey = userData?.user?.privateKey;

      if (encryptedPrivateKey) {
        const decryptedKeyString = CryptoJS.AES.decrypt(
          encryptedPrivateKey,
          savedPassword,
        ).toString(CryptoJS.enc.Utf8);
        const decryptedPrivateKeyUint8 =
          naclUtil.decodeBase64(decryptedKeyString);
        
        const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8);
        dispatch(saveDecryptedPrivateKey(base64Key));
      }

      dispatch(saveLoginUserDetailsReducer(fixedUserData));
      toast.success(response?.message);
      navigateToRoleDashboard(userData);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.error ||
        "Unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const navigateToRoleDashboard = (data: any) => {
    const role = data?.user?.role;

    if (role === "client") return navigate("/documents");
    if (role === "superAdmin") return navigate("/admin-dashboard");

    if (role === "provider") {
      return navigate("/dashboard");
    }

    return navigate("/dashboard");
  };

  return (
    <>
      {isLoading && <Loader />}
      <AuthLayout heading={show2FA ? "Two-Factor Auth" : "sign in"}>
        {!show2FA ? (
          <form onSubmit={handleSubmit(loginFunction)}>
            <div className="flex items-end justify-end flex-col w-full">
              <div className="mb-4 w-full">
                <InputField
                  label="Email"
                  register={register("email")}
                  placeHolder="Enter Email."
                  error={errors.email?.message}
                />
              </div>
              <div className="mb-4 w-full">
                <InputField
                  label="Password"
                  type="password"
                  register={register("password")}
                  placeHolder="Enter Password."
                  error={errors.password?.message}
                />
              </div>
              <NavLink
                to="/forgot-password"
                className="text-primaryColorDark text-sm"
              >
                Forgot Password
              </NavLink>
            </div>

            <div className="mt-10">
              <Button text="sign in" />
            </div>

            <p className="font-normal labelNormal  text-center mt-14">
              {" "}
              Don’t have an account{" "}
              <span
                className="capitalize text-greenColor underline font-bold cursor-pointer"
                onClick={() => {
                  navigate("/provider-signup");
                }}
              >
                Sign up
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit}>
            <div className="flex items-end justify-end flex-col w-full">
              <div className="mb-4 w-full">
                <label className="text-[14px] text-textColor font-semibold mb-2 block">
                  {isRecoveryMode ? "Recovery Code" : "6-Digit Authenticator Code"}
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3 border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-primaryColor"
                  placeholder={isRecoveryMode ? "Enter recovery code" : "Enter 6-digit code"}
                  value={twoFaToken}
                  onChange={(e) => setTwoFaToken(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button text="Verify" />
            </div>

            <p className="font-normal labelNormal text-center mt-8">
              <span
                className="text-primaryColorDark underline cursor-pointer"
                onClick={() => setIsRecoveryMode(!isRecoveryMode)}
              >
                {isRecoveryMode
                  ? "Use Authenticator App instead"
                  : "Use a recovery code instead"}
              </span>
            </p>
            <p className="font-normal labelNormal text-center mt-4">
              <span
                className="text-textGreyColor underline cursor-pointer"
                onClick={() => {
                  setShow2FA(false);
                  setTwoFaToken("");
                  setSavedPassword("");
                }}
              >
                Back to Login
              </span>
            </p>
          </form>
        )}
      </AuthLayout>
    </>
  );
};

export default Login;
