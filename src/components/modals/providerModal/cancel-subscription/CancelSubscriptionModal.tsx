import React from 'react';
import { Crown, ChevronDown } from 'lucide-react';
import ModalLayout from '../../modalLayout/ModalLayout';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isCancelSubscriptionModalShowReducer } from '../../../../redux/slices/ModalSlice';
import { subscriptionApiService } from '../../../../services/subscriptionApiService';
import { toast } from 'react-toastify';

const CancelSubscriptionModalBody = () => {
    const dispatch = useDispatch<AppDispatch>();

    return (
        <div className="flex flex-col items-center text-center p-2">
            {/* Crown Icon in Green Circle */}
            <div className="w-[100px] h-[100px] mt-3 rounded-full bg-linear-to-b from-[#8ADE88] to-[#2C9993] flex items-center justify-center mb-6">
                <Crown className="w-[50px] h-[50px] text-white" />
            </div>

            <h2 className="text-[24px] font-bold text-[#101828] mb-3 font-[Poppins]">Cancel Subscription</h2>

            <p className="text-[16px] text-[#666666] mb-8 max-w-[400px] leading-relaxed font-[Poppins]">
                Your feedback helps us improve. Before you leave, would you mind sharing why you're cancelling?
            </p>

            <div className="w-full text-left mb-8">
                <label className="block text-[14px] font-medium text-[#101828] mb-2 font-[Poppins]">Select a Reason</label>
                <div className="relative">
                    <select className="w-full bg-[#F2F4F7] border-none rounded-[8px] p-4 pr-10 text-[16px] text-[#666666] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2C9993]/20 font-[Poppins] cursor-pointer">
                        <option value="">Select</option>
                        <option value="too-expensive">Too expensive</option>
                        <option value="missing-features">Missing features</option>
                        <option value="switching">Switching to another service</option>
                        <option value="not-using">Not using it enough</option>
                        <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666] pointer-events-none" />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                    onClick={() => dispatch(isCancelSubscriptionModalShowReducer(false))}
                    className="flex-1 py-3 px-4 border border-[#2C9993] text-[#2C9993] rounded-[8px] font-semibold text-[16px] hover:bg-[#2C9993]/5 transition-colors font-[Poppins]"
                >
                    Keep My Subscription
                </button>
                <button
                    onClick={async () => {
                        const selectElement = document.querySelector('select');
                        const reason = selectElement?.value;

                        if (!reason) {
                            toast.warning("Please select a reason for cancellation");
                            return;
                        }

                        try {
                            const response = await subscriptionApiService.cancelSubscription(reason);
                            toast.success(response.message || "Subscription canceled successfully");
                            dispatch(isCancelSubscriptionModalShowReducer(false));
                            // Refresh page to show updated status
                            window.location.reload();
                        } catch (error: any) {
                            const message = error.response?.data?.message || "Cancellation failed";
                            toast.error(message);
                            console.error("Cancellation failed", error);
                        }
                    }}
                    className="flex-1 py-3 px-4 bg-[#2C9993] text-white rounded-[8px] font-semibold text-[16px] hover:bg-[#2C9993]/90 transition-colors font-[Poppins]"
                >
                    Continue with Cancellation
                </button>
            </div>
        </div>
    );
};

const CancelSubscriptionModal: React.FC = () => {
    return (
        <ModalLayout
            heading=""
            modalBodyContent={<CancelSubscriptionModalBody />}
        />
    );
};

export default CancelSubscriptionModal;
