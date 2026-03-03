import React, { useState } from 'react';
import { Crown, ChevronDown } from 'lucide-react';
import ModalLayout from '../../modalLayout/ModalLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { isCancelSubscriptionModalShowReducer } from '../../../../redux/slices/ModalSlice';
import { subscriptionApiService } from '../../../../services/subscriptionApiService';
import { toast } from 'react-toastify';
import authService from '../../../../apiServices/authApi/AuthApi';
import { saveLoginUserDetailsReducer, setIsRefreshing } from '../../../../redux/slices/LoginUserDetailSlice';


interface CancelSubscriptionModalProps {
    onClose?: () => void;
}

const CancelSubscriptionModalBody: React.FC<CancelSubscriptionModalProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail.userDetails);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState("");

    const handleCancel = async () => {
        if (isLoading) return;

        if (!reason) {
            toast.warning("Please select a reason for cancellation");
            return;
        }

        try {
            setIsLoading(true);
            const response = await subscriptionApiService.cancelSubscription(reason);
            toast.success(response.message || "Subscription canceled successfully");

            // Immediately refresh user data so the restricted UI shows at once
            if (userDetails?.user?.id && userDetails?.user?.role) {
                dispatch(setIsRefreshing(true));
                try {
                    const refreshedUser = await authService.getMe(userDetails.user.id, userDetails.user.role);

                    // Match the same resilient pattern used in App.tsx for extracting user data
                    let updatedDetails: any = null;
                    if (refreshedUser?.data?.data && refreshedUser.data.data.user) {
                        updatedDetails = refreshedUser.data.data;
                    } else if (refreshedUser?.data && refreshedUser.data.user) {
                        updatedDetails = refreshedUser.data;
                    } else if (refreshedUser?.user) {
                        updatedDetails = refreshedUser;
                    }

                    if (updatedDetails) {
                        dispatch(saveLoginUserDetailsReducer(updatedDetails));
                    }
                } catch (refreshError) {
                    console.error("Failed to refresh user data after cancellation:", refreshError);
                } finally {
                    dispatch(setIsRefreshing(false));
                }
            }

            onClose?.();

        } catch (error: any) {
            const message = error.response?.data?.message || "Cancellation failed";
            toast.error(message);
            console.error("Cancellation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center p-2">

            <hr className='w-full h-1 text-[#F3F3F3]  mb-4 mt-3' />
            {/* Crown Icon in Green Circle */}
            <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                <circle cx="57.9499" cy="57.9499" r="57.9499" fill="url(#paint0_linear_2662_2095)" />
                <path d="M29.9023 68.1435L26.0241 42.9367C25.9611 42.5238 26.0223 42.1015 26.2001 41.7235C26.3779 41.3456 26.6641 41.0291 27.0224 40.8144C27.3807 40.5997 27.7947 40.4965 28.2119 40.518C28.629 40.5395 29.0303 40.6846 29.3646 40.935L41.4474 49.996C41.7613 50.2315 42.12 50.4006 42.5016 50.4928C42.8831 50.5849 43.2794 50.5983 43.6663 50.5321C44.0532 50.4659 44.4225 50.3214 44.7516 50.1075C45.0808 49.8937 45.3628 49.6149 45.5805 49.2883L55.6403 34.1923C55.8855 33.8255 56.2174 33.5248 56.6066 33.3168C56.9958 33.1088 57.4302 33 57.8715 33C58.3128 33 58.7472 33.1088 59.1364 33.3168C59.5256 33.5248 59.8575 33.8255 60.1028 34.1923L70.1625 49.2798C70.3802 49.6064 70.6623 49.8852 70.9914 50.099C71.3205 50.3129 71.6898 50.4574 72.0767 50.5236C72.4636 50.5898 72.8599 50.5764 73.2414 50.4843C73.623 50.3921 73.9817 50.223 74.2956 49.9875L86.3784 40.9265C86.7127 40.6761 87.114 40.531 87.5312 40.5095C87.9483 40.488 88.3623 40.5912 88.7206 40.8059C89.0789 41.0206 89.3652 41.3371 89.5429 41.715C89.7207 42.093 89.782 42.5153 89.7189 42.9282L85.8408 68.135L29.9023 68.1435ZM29.9023 72.8057H85.845V79.2126C85.845 79.5957 85.7695 79.9751 85.6229 80.3291C85.4763 80.6831 85.2614 81.0047 84.9905 81.2757C84.7195 81.5466 84.3979 81.7615 84.0439 81.9081C83.6899 82.0547 83.3105 82.1302 82.9274 82.1302H32.8199C32.4367 82.1302 32.0573 82.0547 31.7034 81.9081C31.3494 81.7615 31.0277 81.5466 30.7568 81.2757C30.2096 80.7285 29.9023 79.9864 29.9023 79.2126V72.8057Z" fill="white" />
                <g filter="url(#filter0_d_2662_2095)">
                    <circle cx="58.1119" cy="58.3726" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                </g>
                <defs>
                    <filter id="filter0_d_2662_2095" x="4.51101" y="6.97028" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="2.19853" />
                        <feGaussianBlur stdDeviation="1.46568" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2662_2095" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2662_2095" result="shape" />
                    </filter>
                    <linearGradient id="paint0_linear_2662_2095" x1="57.9499" y1="0" x2="57.9499" y2="115.9" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#B9EA6A" />
                        <stop offset="1" stop-color="#2C9993" />
                    </linearGradient>
                </defs>
            </svg>
            <h2 className="text-[24px] font-bold text-[#101828] mb-3 mt-3 font-[Poppins]">Cancel Subscription</h2>

            <p className="text-[16px] text-[#666666] mb-8 max-w-[400px] leading-relaxed font-[Poppins]">
                Your feedback helps us improve. Before you leave, would you mind sharing why you're cancelling?
            </p>

            <div className="w-full text-left mb-8">
                <label className="block text-[14px] font-medium text-[#101828] mb-2 font-[Poppins]">Select a Reason</label>
                <div className="relative">
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-[#F2F4F7] border-none rounded-[8px] p-4 pr-10 text-[16px] text-[#666666] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2C9993]/20 font-[Poppins] cursor-pointer"
                    >
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
                    onClick={() => onClose?.()}
                    disabled={isLoading}
                    className={`flex-1 py-3 px-4 border border-[#2C9993] text-[#2C9993] rounded-[8px] font-semibold text-[16px] transition-colors font-[Poppins] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#2C9993]/5'}`}
                >
                    Keep My Subscription
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className={`flex-1 py-3 px-4 bg-[#2C9993] text-white rounded-[8px] font-semibold text-[16px] transition-colors font-[Poppins] flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-[#2C9993]/90'}`}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Canceling...
                        </div>
                    ) : (
                        "Continue with Cancellation"
                    )}
                </button>
            </div>
        </div>
    );
};

interface CancelSubscriptionModalMainProps {
    onClose?: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalMainProps> = ({ onClose }) => {
    return (
        <ModalLayout
            heading=""
            modalBodyContent={<CancelSubscriptionModalBody onClose={onClose} />}
        />
    );
};

export default CancelSubscriptionModal;
