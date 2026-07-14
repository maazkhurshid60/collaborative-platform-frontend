
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { toast } from "react-toastify";
import inviteApiService from "../../../../apiServices/chatApi/inviteApi/InviteApi";

type InviteProviderModalProps = {
  onClose?: () => void;
};
const InviteProviderModal: React.FC<InviteProviderModalProps> = ({ onClose }) => {
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
        onClose?.();
      }
      else if (res.statusCode === 409) {
        toast.info(res.message || "Provider is already on the platform");
      }
      else {
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
    <div className="flex flex-col gap-3">
      <label className="text-sm text-gray-600">Invite provider by email</label>

      <input
        className="border rounded-md px-3 py-2 text-sm outline-none"
        placeholder="provider@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="bg-teal-700 text-white cursor-pointer rounded-md py-2 text-sm disabled:opacity-60"
        disabled={isSending}
        onClick={onSend}
      >
        {isSending ? "Sending..." : "Send Invite"}
      </button>

      {/* Optional cancel button */}
      <button
        type="button"
        className="border cursor-pointer rounded-md py-2 text-sm"
        onClick={onClose}
        disabled={isSending}
      >
        Cancel
      </button>

      <p className="text-xs text-gray-500">
        The email will include a link to sign up:{" "}
        <span className="font-medium">/provider-signup</span>
      </p>
    </div>
  );
};

export default InviteProviderModal;
