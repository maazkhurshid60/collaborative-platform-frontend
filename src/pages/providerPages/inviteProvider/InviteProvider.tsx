import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";
import inviteApiService from "../../../apiServices/chatApi/inviteApi/InviteApi";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";
import InputField from "../../../components/inputField/InputField";
import { HiOutlineMail, HiOutlineClipboardCheck, HiOutlineShare } from "react-icons/hi";
import { FiUsers, FiInfo, FiCopy, FiCheckCircle } from "react-icons/fi";

const InviteProvider = () => {
  const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // Invitation message (simulated content)
  const inviteLink = `${window.location.origin}/provider-signup?ref=${loginUserId || "admin"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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

      const res = await inviteApiService.inviteProviderSignup({
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
    <OutletLayout heading="Grow Your Network">
      <div className="flex items-center justify-center min-h-[60vh] w-full py-8">

        {/* Unified Professional Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[400px]">

          {/* Internal Left: Information (Context) */}
          <div className="flex-1 bg-gray-50/50 p-10 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6 text-primaryColor">
              <FiUsers size={28} />
              <h2 className="text-2xl font-bold">Invite Colleagues</h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-10">
              Empower your professional circle by inviting trusted colleagues to join the platform.
              Collaborating with your expert network ensures a seamless workflow and superior results for your clients.
            </p>

            <div className="space-y-6">
              {[
                { icon: <FiCheckCircle className="text-green-500" />, title: "Trusted Network", sub: "Grow your secure collaborator circle" },
                { icon: <HiOutlineMail className="text-blue-500" />, title: "Automated Setup", sub: "Secure registration links via email" },
                { icon: <FiInfo className="text-gray-400" />, title: "Seamless Integration", sub: "Recipients link directly to your network" }
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <span className="mt-1">{item.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Right: Invitation Form */}
          <div className="flex-1 p-10 flex flex-col justify-center bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Send Invitation</h3>
            <p className="text-xs text-gray-500 mb-8 font-medium">Please enter the email address of the professional you wish to invite.</p>

            <div className="space-y-8">
              <InputField
                label="Invitee's Email Address"
                placeHolder="colleague@professional.com"
                value={email}
                register={{
                  onChange: (e: any) => setEmail(e.target.value),
                  name: "email"
                } as any}
              />

              <div className="w-full sm:w-[200px]">
                <Button
                  text={isSending ? "Sending..." : "Send Invitation"}
                  onclick={onSend}
                  disabled={isSending}
                  isLoading={isSending}
                />
              </div>
            </div>

            <div className="mt-12 p-4 bg-blue-50/30 rounded-2xl border border-blue-50 flex gap-3 items-start">
              <FiInfo className="text-blue-400 mt-0.5" size={16} />
              <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                Recipients will receive a secure email containing their uniquely generated registration link.
              </p>
            </div>
          </div>

        </div>

      </div>
    </OutletLayout>
  );
};

export default InviteProvider;
