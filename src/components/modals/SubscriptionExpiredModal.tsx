import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SubscriptionExpiredModalProps {
    onClose?: () => void;
}

const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;


    return (
        <div
            className="fixed inset-0 bg-textColor/70 z-50 overflow-y-auto p-4 "
            onClick={handleClose}
        >
            <div className="flex min-h-full items-center justify-center">
                <div
                    className="bg-white w-[766px] max-w-full rounded-[32px] p-10 relative shadow-2xl flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='flex flex-col items-center justify-end gap-y-2'>
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-8 right-8 text-[#101828] hover:opacity-70 cursor-pointer transition-all"
                        >
                            <X size={32} strokeWidth={2.5} />
                        </button>

                    </div>
                    <div className="w-full border mt-8 border-[#E2E8F0]" />

                    {/* Header Icon */}
                    <div className="mb-6 mt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="116" height="176" viewBox="0 0 116 176" fill="none">
                            <circle cx="57.9499" cy="87.8483" r="57.9499" fill="url(#paint0_linear_2689_997)" />
                            <path d="M33.2002 107.148C33.2002 106.596 33.6479 106.148 34.2002 106.148H81.8002C82.3525 106.148 82.8002 106.596 82.8002 107.148V110.148C82.8002 110.701 82.3525 111.148 81.8002 111.148H34.2002C33.6479 111.148 33.2002 110.701 33.2002 110.148V107.148ZM33.2002 73.078C33.2002 72.2672 34.1143 71.7935 34.7767 72.2609L44.8131 79.343C45.2525 79.6531 45.8584 79.5601 46.1846 79.1326L57.2052 64.6902C57.6054 64.1658 58.395 64.1658 58.7952 64.6902L69.8158 79.1326C70.142 79.5601 70.7479 79.6531 71.1873 79.343L81.2236 72.2609C81.8861 71.7935 82.8002 72.2672 82.8002 73.078V100.148C82.8002 100.701 82.3525 101.148 81.8002 101.148H34.2002C33.6479 101.148 33.2002 100.701 33.2002 100.148V73.078ZM39.7377 81.8644C39.0754 81.3959 38.1602 81.8695 38.1602 82.6808V95.1484C38.1602 95.7007 38.6079 96.1484 39.1602 96.1484H76.8402C77.3925 96.1484 77.8402 95.7007 77.8402 95.1484V82.6808C77.8402 81.8695 76.925 81.3959 76.2627 81.8644L70.1464 86.1911C69.7068 86.5021 69.1 86.4092 68.7736 85.981L58.7955 72.8917C58.3953 72.3667 57.6051 72.3667 57.2049 72.8917L47.2268 85.981C46.9004 86.4092 46.2936 86.5021 45.854 86.1911L39.7377 81.8644Z" fill="white" />
                            <g filter="url(#filter0_d_2689_997)">
                                <circle cx="58.1119" cy="88.2711" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                            </g>
                            <defs>
                                <filter id="filter0_d_2689_997" x="4.51101" y="36.8687" width="116" height="176" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="2.19853" />
                                    <feGaussianBlur stdDeviation="1.46568" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2689_997" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2689_997" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_2689_997" x1="57.9499" y1="29.8984" x2="57.9499" y2="145.798" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#EA6A6A" />
                                    <stop offset="1" stop-color="#992C2C" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>


                    <h2 className="text-[24px] font-semibold text-[#101828] font-[Poppins] mb-1 text-center">
                        Subscription Expired
                    </h2>
                    <p className="text-[16px] text-[#667085] font-normal font-[Poppins] mb-8 text-center">
                        Your subscription has expired. Renew now to restore access to all premium features and continue where you left off.</p>
                    {/* Footer Buttons */}
                    <div className="flex flex-row gap-6 w-full mt-auto">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] border-2 border-[#E2E8F0] text-[#101828] rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-gray-50 transition-all"
                        >
                            View Plans
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] bg-[#2C9993] text-white rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-xl"
                        >
                            Renew Subscription                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpiredModal;
