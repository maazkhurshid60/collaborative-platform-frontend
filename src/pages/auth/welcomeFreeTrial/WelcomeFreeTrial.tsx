import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, PartyPopper } from "lucide-react";
import { RootState } from "../../../redux/store";

const META_PIXEL_ID = "1321098516763010";

const features = [
  "Up to 100 Clients",
  "Provider to Provider Communication",
  "Invite Providers to Platfrom",
  "Add Your Client To Platform",
  "Share Documents with Clients",
  "Basic Invoicing & Billing",
];

type FacebookPixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FacebookPixel;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

const loadMetaPixel = () => {
  if (window.fbq) return;

  const fbq: FacebookPixel = (...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document
    .getElementsByTagName("script")[0]
    ?.parentNode?.insertBefore(
      script,
      document.getElementsByTagName("script")[0],
    );

  fbq("init", META_PIXEL_ID);
};

const LEAD_FLAG_KEY = "kolabFreeTrialLead";

const WelcomeFreeTrial = () => {
  const navigate = useNavigate();
  const [arrivedFromConfirmation] = useState(
    () => sessionStorage.getItem(LEAD_FLAG_KEY) === "1",
  );
  const userDetails = useSelector(
    (state: RootState) => state.LoginUserDetail?.userDetails,
  );
  const fullName = userDetails?.user?.fullName;

  useEffect(() => {
    // Re-check sessionStorage directly (rather than the captured state value) so this
    // stays a no-op on React StrictMode's second dev-mode effect invocation.
    if (sessionStorage.getItem(LEAD_FLAG_KEY) !== "1") return;
    sessionStorage.removeItem(LEAD_FLAG_KEY);
    loadMetaPixel();
    window.fbq?.("track", "Lead");
  }, []);

  if (!arrivedFromConfirmation) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-[Poppins] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-160 bg-white rounded-4xl shadow-sm p-10 md:p-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-6">
          <PartyPopper size={36} className="text-[#059669]" />
        </div>

        <h1 className="text-[32px] md:text-[40px] font-bold text-[#101828] mb-2">
          {fullName ? `Welcome, ${fullName}!` : "Welcome to Kolab Me!"}
        </h1>
        <p className="text-[16px] md:text-[18px] text-[#667085] mb-8">
          Your free trial has started. Here&apos;s what you get access to right
          away.
        </p>

        <div className="w-full bg-inputBgColor rounded-2xl p-6 text-left mb-8">
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  <Check size={18} className="text-[#059669]" strokeWidth={3} />
                </div>
                <span className="text-[14px] text-[#666666]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full md:w-auto px-10 py-3 rounded-xl bg-[#2C9993] text-white font-bold text-[18px] hover:bg-[#237c76] shadow-lg shadow-[#2c9993]/20 transition-all cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WelcomeFreeTrial;
