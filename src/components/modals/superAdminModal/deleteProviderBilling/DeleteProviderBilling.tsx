import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteProviderBillingProps {
    onClose?: () => void;
}

const DeleteProviderBilling: React.FC<DeleteProviderBillingProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 bg-textColor/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="bg-white w-full max-w-[500px] rounded-[24px] p-8 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-[#666666] hover:text-[#101828] cursor-pointer transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center pt-4">
                    {/* Warning Icon with red gradient background */}
                    <div className="relative mb-6">
                        <div className="w-[100px] h-[100px] rounded-full bg-red-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                                <circle cx="57.9499" cy="57.9499" r="57.9499" fill="url(#paint0_linear_2964_3275)" />
                                <path d="M80.5 38H72.75C72.1698 35.1785 70.6346 32.6434 68.4031 30.8218C66.1717 29.0002 63.3805 28.0036 60.5 28L55.5 28C52.6195 28.0036 49.8283 29.0002 47.5969 30.8218C45.3655 32.6434 43.8302 35.1785 43.25 38H35.5C34.837 38 34.2011 38.2634 33.7322 38.7322C33.2634 39.2011 33 39.837 33 40.5C33 41.163 33.2634 41.7989 33.7322 42.2678C34.2011 42.7366 34.837 43 35.5 43H38V75.5C38.004 78.814 39.3222 81.9911 41.6656 84.3345C44.0089 86.6778 47.186 87.996 50.5 88H65.5C68.814 87.996 71.9911 86.6778 74.3345 84.3345C76.6778 81.9911 77.996 78.814 78 75.5V43H80.5C81.163 43 81.7989 42.7366 82.2678 42.2678C82.7366 41.7989 83 41.163 83 40.5C83 39.837 82.7366 39.2011 82.2678 38.7322C81.7989 38.2634 81.163 38 80.5 38ZM55.5 33H60.5C62.0507 33.0019 63.5628 33.4834 64.829 34.3786C66.0952 35.2738 67.0535 36.5387 67.5725 38H48.4275C48.9465 36.5387 49.9048 35.2738 51.171 34.3786C52.4372 33.4834 53.9493 33.0019 55.5 33ZM73 75.5C73 77.4891 72.2098 79.3968 70.8033 80.8033C69.3968 82.2098 67.4891 83 65.5 83H50.5C48.5109 83 46.6032 82.2098 45.1967 80.8033C43.7902 79.3968 43 77.4891 43 75.5V43H73V75.5Z" fill="white" />
                                <path d="M53 73C53.663 73 54.2989 72.7366 54.7678 72.2678C55.2366 71.7989 55.5 71.163 55.5 70.5V55.5C55.5 54.837 55.2366 54.2011 54.7678 53.7322C54.2989 53.2634 53.663 53 53 53C52.337 53 51.7011 53.2634 51.2322 53.7322C50.7634 54.2011 50.5 54.837 50.5 55.5V70.5C50.5 71.163 50.7634 71.7989 51.2322 72.2678C51.7011 72.7366 52.337 73 53 73Z" fill="white" />
                                <path d="M63 73C63.663 73 64.2989 72.7366 64.7678 72.2678C65.2366 71.7989 65.5 71.163 65.5 70.5V55.5C65.5 54.837 65.2366 54.2011 64.7678 53.7322C64.2989 53.2634 63.663 53 63 53C62.337 53 61.7011 53.2634 61.2322 53.7322C60.7634 54.2011 60.5 54.837 60.5 55.5V70.5C60.5 71.163 60.7634 71.7989 61.2322 72.2678C61.7011 72.7366 62.337 73 63 73Z" fill="white" />
                                <g filter="url(#filter0_d_2964_3275)">
                                    <circle cx="58.1119" cy="58.3726" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                                </g>
                                <defs>
                                    <filter id="filter0_d_2964_3275" x="4.51101" y="6.97028" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                        <feOffset dy="2.19853" />
                                        <feGaussianBlur stdDeviation="1.46568" />
                                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2964_3275" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2964_3275" result="shape" />
                                    </filter>
                                    <linearGradient id="paint0_linear_2964_3275" x1="57.9499" y1="0" x2="57.9499" y2="115.9" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#EA6A6A" />
                                        <stop offset="1" stop-color="#992C2C" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>


                    <h2 className="text-[28px] font-bold text-[#101828] font-[Poppins] mb-3 text-center leading-tight">
                        Delete Provider Billing
                    </h2>
                    <p className="text-[16px] text-[#666666] font-[Poppins] mb-10 text-center max-w-[340px]">
                        Are you sure you want to delete provider billing!
                    </p>

                    <div className="flex flex-row gap-4 w-full">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] border-2 border-[#2C9993] text-[#2C9993] rounded-[12px] font-semibold text-[18px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 h-[60px] bg-[#2C9993] text-white rounded-[12px] font-semibold text-[18px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-[0_4px_14px_0_rgba(44,153,147,0.39)]"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteProviderBilling;
