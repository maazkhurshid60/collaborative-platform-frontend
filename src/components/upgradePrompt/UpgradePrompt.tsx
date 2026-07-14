import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

interface UpgradePromptProps {
  message?: string;
  showFullScreen?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  message = "Upgrade your plan to access this feature",
  showFullScreen = false,
}) => {
  const navigate = useNavigate();

  if (showFullScreen) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#2C9993]" size={32} />
          </div>
          <h2 className="text-[24px] font-bold text-[#101828] mb-3">
            Premium Feature
          </h2>
          <p className="text-[16px] text-[#667085] mb-6">{message}</p>
          <button
            onClick={() => navigate("/select-plan")}
            className="w-full bg-[#2C9993] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#237c76] transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // Inline prompt (for buttons/actions)
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] border border-[#2C9993] rounded-lg">
      <Lock className="text-[#2C9993]" size={16} />
      <span className="text-[14px] text-[#2C9993] font-medium">{message}</span>
      <button
        onClick={() => navigate("/select-plan")}
        className="ml-2 text-[14px] text-[#2C9993] font-semibold underline hover:text-[#237c76]"
      >
        Upgrade
      </button>
    </div>
  );
};

export default UpgradePrompt;
