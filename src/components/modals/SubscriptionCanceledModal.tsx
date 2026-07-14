import React from 'react';
import { Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionCanceledModalProps {
    onClose?: () => void;
}

const SubscriptionCanceledModal: React.FC<SubscriptionCanceledModalProps> = ({ onClose }) => {
    const navigate = useNavigate();

    const handleClose = () => {
        onClose?.();
    };

    const handleViewPlans = () => {
        handleClose();
        navigate('/select-plan');
    };

    return (
        <div
            className="fixed inset-0 bg-textColor/70 z-50 overflow-y-auto p-4 flex items-center justify-center"
            onClick={handleClose}
        >
            <div
                className="bg-white w-[766px] max-w-full rounded-[32px] p-10 relative shadow-2xl flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-8 right-8 text-[#101828] hover:opacity-70 cursor-pointer transition-all"
                >
                    <X size={32} strokeWidth={2.5} />
                </button>

                <div className="w-full border mt-8 border-[#E2E8F0]" />

                {/* Success Icon */}
                <div className="w-[120px] h-[120px] mt-8 rounded-full bg-linear-to-b from-[#8ADE88] to-[#2C9993] flex items-center justify-center mb-6 shadow-lg" >
                    <Crown className="w-[60px] h-[60px] text-white" />
                </div>

                <h2 className="text-[32px] font-bold text-[#101828] font-[Poppins] mb-3 text-center">
                    Subscription Canceled
                </h2>
                <p className="text-[18px] text-[#667085] font-normal font-[Poppins] mb-10 text-center max-w-[500px]">
                    Your subscription has been successfully canceled. You still have access to your account with restricted features.
                </p>

                {/* Footer Buttons */}
                <div className="flex flex-row gap-6 w-full mt-auto">
                    <button
                        onClick={handleClose}
                        className="flex-1 h-[50px] border-2 border-[#E2E8F0] text-[#101828] rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-gray-50 transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleViewPlans}
                        className="flex-1 h-[50px] bg-[#2C9993] text-white rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-xl"
                    >
                        View Plans
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCanceledModal;
