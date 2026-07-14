import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

import { AppDispatch, RootState } from "../../redux/store";
import OutletLayout from "../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../components/icons/back/Back";
import Button from "../../components/button/Button";
import authService from "../../apiServices/authApi/AuthApi";
import { saveLoginUserDetailsReducer } from "../../redux/slices/LoginUserDetailSlice";

const TwoFactorSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const is2FAEnabled = loginUserDetail?.user?.isTwoFactorEnabled;

  const generate2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await authService.generate2FA();
      return response.data;
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to generate 2FA");
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (currentToken: string) => {
      const response = await authService.enable2FA(currentToken);
      return response.data;
    },
    onSuccess: (data) => {
      setRecoveryCodes(data.recoveryCodes);

      // Update local state
      const updatedUserDetail = {
        ...loginUserDetail,
        user: { ...loginUserDetail.user, isTwoFactorEnabled: true },
      };
      dispatch(saveLoginUserDetailsReducer(updatedUserDetail));
      toast.success("Two-Factor Authentication enabled successfully!");
      setQrCodeUrl("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid token");
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async ({
      currentToken,
      isRecoveryCode,
    }: {
      currentToken: string;
      isRecoveryCode?: boolean;
    }) => {
      await authService.disable2FA(currentToken, isRecoveryCode);
    },
    onSuccess: () => {
      // Update local state
      const updatedUserDetail = {
        ...loginUserDetail,
        user: { ...loginUserDetail.user, isTwoFactorEnabled: false },
      };
      dispatch(saveLoginUserDetailsReducer(updatedUserDetail));
      toast.success("Two-Factor Authentication disabled.");
      setToken("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid token");
    },
  });

  const generate2FA = () => generate2FAMutation.mutate();

  const enable2FA = () => {
    if (!token) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    enable2FAMutation.mutate(token);
  };

  const disable2FA = () => {
    if (!token) {
      toast.error("Please enter your 2FA code or recovery code to disable");
      return;
    }
    const isRecoveryCode = token.length > 6;
    disable2FAMutation.mutate({ currentToken: token, isRecoveryCode });
  };

  const downloadRecoveryCodes = () => {
    if (recoveryCodes.length === 0) return;
    const content = `KolabMe Two-Factor Authentication Recovery Codes\n\n${recoveryCodes.join("\n")}\n\nKeep these secure. Each code can only be used once.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kolabme-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isGenerating = generate2FAMutation.isPending;
  const isEnabling =
    enable2FAMutation.isPending || disable2FAMutation.isPending;

  return (
    <OutletLayout
      backButton={<BackIcon onClick={() => navigate(-1)} />}
      isWhiteColor={false}
    >
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-200 mt-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">
          Two-Factor Authentication (2FA)
        </h2>
        <p className="text-textGreyColor mb-6">
          Add an extra layer of security to your account by enabling 2FA.
        </p>

        {is2FAEnabled ? (
          <div>
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6 border border-green-200 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">2FA is Enabled</h3>
                <p className="text-sm text-green-700 mt-0.5">
                  Your account is currently protected by Two-Factor
                  Authentication.
                </p>
              </div>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="mb-8 border border-gray-200 rounded-md p-4">
                <h3 className="font-bold text-lg mb-2">Recovery Codes</h3>
                <p className="text-sm text-textGreyColor mb-4">
                  Save these recovery codes in a secure place. You can use them
                  to access your account if you lose your authenticator device.
                  Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-md">
                  {recoveryCodes.map((code, index) => (
                    <code
                      key={index}
                      className="font-mono text-center tracking-widest bg-white p-2 border border-gray-200 rounded"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <div className="mt-4 w-56">
                  <Button
                    text="Download Recovery Codes"
                    onclick={downloadRecoveryCodes}
                  />
                </div>
              </div>
            )}

            <div className="border border-red-200 rounded-md p-6 bg-red-50">
              <h3 className="font-bold text-lg text-red-700 mb-2">
                Disable 2FA
              </h3>
              <p className="text-sm text-red-700/80 mb-4">
                To disable 2FA, please enter your current 6-digit authenticator
                code or a recovery code.
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit or recovery code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full max-w-xs h-11 px-3 border border-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 mb-4 block"
              />
              <div className="w-32">
                <Button
                  text={isEnabling ? "Disabling..." : "Disable"}
                  onclick={disable2FA}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6 border border-yellow-200 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  2FA is Disabled
                </h3>
                <p className="text-sm text-yellow-700 mt-0.5">
                  We highly recommend enabling 2FA to add an extra layer of
                  security to your account.
                </p>
              </div>
            </div>

            {!qrCodeUrl ? (
              <Button
                text={isGenerating ? "Generating..." : "Set up 2FA"}
                onclick={generate2FA}
              />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-start border border-gray-200 p-6 rounded-md">
                <div>
                  <h3 className="font-bold text-lg mb-2">1. Scan QR Code</h3>
                  <p className="text-sm text-textGreyColor mb-4 max-w-xs">
                    Use an authenticator app (like Google Authenticator or
                    Authy) to scan this QR code.
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="border border-gray-200 p-2 rounded-md bg-white w-48 h-48"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">2. Enter Code</h3>
                  <p className="text-sm text-textGreyColor mb-4">
                    Enter the 6-digit code generated by your authenticator app
                    to verify and enable 2FA.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-11 px-3 border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-primaryColor mb-4"
                  />
                  <Button
                    text={isEnabling ? "Verifying..." : "Verify & Enable"}
                    onclick={enable2FA}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </OutletLayout>
  );
};

export default TwoFactorSettings;
