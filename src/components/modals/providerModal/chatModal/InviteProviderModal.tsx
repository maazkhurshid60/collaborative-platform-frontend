// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../redux/store";
// import { toast } from "react-toastify";
// import inviteApiService from "../../../../apiServices/chatApi/inviteApi/InviteApi";

// const InviteProviderModal = () => {
//   const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
//   const [email, setEmail] = useState("");
//   const [isSending, setIsSending] = useState(false);

//   const onSend = async () => {
//     if (!email.trim()) {
//       toast.error("Email is required");
//       return;
//     }

//     // basic email validation
//     const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
//     if (!isValid) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     if (!loginUserId) {
//       toast.error("Login user not found");
//       return;
//     }

//     try {
//       setIsSending(true);
//       await inviteApiService.inviteProviderSignup({
//         invitationEmail: email.trim(),
//         invitedByUserId: loginUserId,
//       });
//       toast.success("Invitation email sent");
//       setEmail("");
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Failed to send invitation");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-3">
//       <label className="text-sm text-gray-600">Invite provider by email</label>

//       <input
//         className="border rounded-md px-3 py-2 text-sm outline-none"
//         placeholder="provider@email.com"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <button
//         className="bg-teal-700 text-white rounded-md py-2 text-sm disabled:opacity-60"
//         disabled={isSending}
//         onClick={onSend}
//       >
//         {isSending ? "Sending..." : "Send Invite"}
//       </button>

//       <p className="text-xs text-gray-500">
//         The email will include a link to sign up: <span className="font-medium">/provider-signup</span>
//       </p>
//     </div>
//   );
// };

// export default InviteProviderModal;


// src/components/modals/providerModal/chatModal/InviteProviderModal.tsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { toast } from "react-toastify";
import inviteApiService from "../../../../apiServices/chatApi/inviteApi/InviteApi";

type InviteProviderModalProps = {
  onClose?: () => void;
};

const InviteProviderModal: React.FC<InviteProviderModalProps> = ({ onClose }) => {
  const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
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

      await inviteApiService.inviteProviderSignup({
        invitationEmail: trimmed,
        invitedByUserId: loginUserId,
      });

      toast.success("Invitation email sent");
      setEmail("");

      // ✅ Close modal after success (optional)
      onClose?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invitation");
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
        className="bg-teal-700 text-white rounded-md py-2 text-sm disabled:opacity-60"
        disabled={isSending}
        onClick={onSend}
      >
        {isSending ? "Sending..." : "Send Invite"}
      </button>

      {/* Optional cancel button */}
      <button
        type="button"
        className="border rounded-md py-2 text-sm"
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
