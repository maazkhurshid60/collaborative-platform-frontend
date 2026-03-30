import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";
import inviteApiService from "../../../apiServices/chatApi/inviteApi/InviteApi";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";
import { useNavigate } from "react-router-dom";

const InviteProvider = () => {
  const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const onSend = async () => {
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error("Email is required");
      return;
    }

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!loginUserId) {
      toast.error("Login user not found");
      return;
    }

    try {
      setIsSending(true);

      const res =
        await inviteApiService.inviteProviderSignup({
          invitationEmail: trimmed,
          invitedByUserId: loginUserId,
        });

      if (res.success) {
        toast.success("Invitation email sent successfully");
        setEmail("");
      } else if (res.statusCode === 409) {
        toast.info(res.message || "Provider is already on the platform");
      } else {
        toast.error(res.message || "Failed to send invitation");
      }
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const message = err?.response?.data?.message || "Failed to send invitation";

      if (statusCode === 409) {
        toast.info(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <OutletLayout heading="Invite Provider">
      <div className="flex flex-col items-center justify-center min-h-[65vh] w-full">
        <div className="bg-white p-6 rounded-lg w-full max-w-lg border border-gray-100 shadow-md flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Invite provider by email</label>

          <input
            className="border border-solid border-[#D9D9D9] rounded-md px-3 py-2 text-sm outline-none placeholder:text-[#A7A7A7]"
            placeholder="provider@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mt-2 w-[160px]">
            <Button
              text={isSending ? "Sending..." : "Send Invite"}
              onclick={onSend}
              disabled={isSending}
              sm
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            The email will include a link to sign up:{" "}
            <span className="font-medium">/provider-signup</span>
          </p>
        </div>
      </div>
    </OutletLayout>
  );
};

export default InviteProvider;
