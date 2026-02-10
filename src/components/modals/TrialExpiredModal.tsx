import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';

interface TrialExpiredModalProps {
    onClose?: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ onClose }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/select-plan');
    };

    const handleLogout = () => {
        // Clear user session
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-[Poppins]">
            <div className="bg-white rounded-[24px] max-w-[500px] w-full p-8 relative shadow-2xl">
                {/* Close Button (Optional) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-[#98A2B3] hover:text-[#101828] transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                {/* Warning Icon */}
                <div className="w-16 h-16 bg-[#FEF3F2] rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-[#F04438]" size={32} />
                </div>

                {/* Title */}
                <h2 className="text-[28px] font-bold text-[#101828] text-center mb-3">
                    Your Trial Has Ended
                </h2>

                {/* Description */}
                <p className="text-[16px] text-[#667085] text-center mb-8">
                    To continue using all features and accessing your dashboard, please upgrade to a paid plan.
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleUpgrade}
                        className="w-full bg-[#2C9993] text-white py-3.5 px-6 rounded-[12px] font-semibold text-[16px] hover:bg-[#237c76] transition-colors shadow-lg shadow-[#2c9993]/20"
                    >
                        Upgrade Now
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-white text-[#667085] py-3.5 px-6 rounded-[12px] font-medium text-[16px] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-[14px] text-[#98A2B3] text-center mt-6">
                    Need help? <a href="mailto:support@kolabme.com" className="text-[#2C9993] hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
};

export default TrialExpiredModal;
