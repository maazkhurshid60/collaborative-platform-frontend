import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface FreeTrailEndedModalProps {
    onClose?: () => void;
}

const FreeTrailEndedModal: React.FC<FreeTrailEndedModalProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 bg-textColor/70 z-50 flex justify-center items-start overflow-y-auto p-4 py-8 md:py-20 backdrop-blur-sm"
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
                                <circle cx="57.9499" cy="57.9499" r="57.9499" fill="url(#paint0_linear_2788_1222)" />
                                <g clip-path="url(#clip0_2788_1222)">
                                    <path d="M57.9993 69.4893C56.2659 69.4893 54.813 70.9422 54.813 72.6755C54.813 74.4089 56.2659 75.8618 57.9993 75.8618C59.6689 75.8618 61.1855 74.4089 61.109 72.752C61.1855 70.9295 59.7453 69.4893 57.9993 69.4893Z" fill="white" />
                                    <path d="M87.4913 80.7816C89.4923 77.3277 89.505 73.211 87.5168 69.7698L67.558 35.2052C65.5825 31.7258 62.0139 29.6611 58.012 29.6611C54.01 29.6611 50.4414 31.7386 48.4659 35.1925L28.4817 69.7953C26.4934 73.2747 26.5062 77.4169 28.5199 80.8708C30.5081 84.2865 34.064 86.3384 38.0405 86.3384H77.907C81.8962 86.3384 85.4776 84.261 87.4913 80.7816ZM83.158 78.2835C82.0492 80.1953 80.0864 81.3296 77.8943 81.3296H38.0277C35.8611 81.3296 33.9111 80.2208 32.8277 78.3473C31.7317 76.4482 31.7189 74.1796 32.815 72.2679L52.7992 37.6778C53.8826 35.7788 55.8198 34.6572 58.012 34.6572C60.1914 34.6572 62.1414 35.7915 63.2247 37.6905L83.1962 72.2806C84.2668 74.1414 84.2541 76.3845 83.158 78.2835Z" fill="white" />
                                    <path d="M57.2088 47.1222C55.6922 47.5555 54.749 48.932 54.749 50.6016C54.8255 51.6084 54.8892 52.628 54.9657 53.6349C55.1824 57.4712 55.399 61.231 55.6157 65.0672C55.6922 66.3672 56.699 67.3104 57.999 67.3104C59.299 67.3104 60.3186 66.3035 60.3823 64.9908C60.3823 64.2006 60.3823 63.4741 60.4588 62.6712C60.599 60.2114 60.7519 57.7516 60.8921 55.2918C60.9686 53.6986 61.1088 52.1055 61.1853 50.5124C61.1853 49.9388 61.1088 49.429 60.8921 48.9192C60.2421 47.4918 58.7255 46.7653 57.2088 47.1222Z" fill="white" />
                                </g>
                                <g filter="url(#filter0_d_2788_1222)">
                                    <circle cx="58.1119" cy="58.3726" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                                </g>
                                <defs>
                                    <filter id="filter0_d_2788_1222" x="4.51101" y="6.97028" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                        <feOffset dy="2.19853" />
                                        <feGaussianBlur stdDeviation="1.46568" />
                                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2788_1222" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2788_1222" result="shape" />
                                    </filter>
                                    <linearGradient id="paint0_linear_2788_1222" x1="57.9499" y1="0" x2="57.9499" y2="115.9" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#EA6A6A" />
                                        <stop offset="1" stop-color="#992C2C" />
                                    </linearGradient>
                                    <clipPath id="clip0_2788_1222">
                                        <rect width="62" height="62" fill="white" transform="translate(27 27)" />
                                    </clipPath>
                                </defs>
                            </svg>
                            {/* <div className="w-[80px] h-[80px] rounded-full bg-linear-to-b from-[#EF4444] to-[#B91C1C] flex items-center justify-center shadow-lg">
                                <AlertTriangle size={40} className="text-white fill-white/10" />
                            </div> */}
                        </div>
                    </div>


                    <h2 className="text-[28px] font-bold text-[#101828] font-[Poppins] mb-3 text-center leading-tight">
                        Your free trial has ended
                    </h2>
                    <p className="text-[16px] text-[#666666] font-[Poppins] mb-10 text-center max-w-[340px]">
                        Upgrade to continue using all features and keep your project growing.
                    </p>

                    <div className="flex flex-row gap-4 w-full">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] border-2 border-[#2C9993] text-[#2C9993] rounded-[12px] font-semibold text-[18px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/5 transition-all"
                        >
                            Maybe Later
                        </button>
                        <button
                            className="flex-1 h-[60px] bg-[#2C9993] text-white rounded-[12px] font-semibold text-[18px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-[0_4px_14px_0_rgba(44,153,147,0.39)]"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeTrailEndedModal;
