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
                            <svg xmlns="http://www.w3.org/2000/svg" width="116" height="176" viewBox="0 0 116 176" fill="none">
                                <circle cx="57.9499" cy="87.8483" r="57.9499" fill="url(#paint0_linear_2788_1220)" />
                                <g clip-path="url(#clip0_2788_1220)">
                                    <path d="M57.9993 99.3877C56.2659 99.3877 54.813 100.841 54.813 102.574C54.813 104.307 56.2659 105.76 57.9993 105.76C59.6689 105.76 61.1855 104.307 61.109 102.65C61.1855 100.828 59.7453 99.3877 57.9993 99.3877Z" fill="white" />
                                    <path d="M87.4913 110.68C89.4923 107.226 89.505 103.109 87.5168 99.6683L67.558 65.1037C65.5825 61.6243 62.0139 59.5596 58.012 59.5596C54.01 59.5596 50.4414 61.637 48.4659 65.0909L28.4817 99.6938C26.4934 103.173 26.5062 107.315 28.5199 110.769C30.5081 114.185 34.064 116.237 38.0405 116.237H77.907C81.8962 116.237 85.4776 114.159 87.4913 110.68ZM83.158 108.182C82.0492 110.094 80.0864 111.228 77.8943 111.228H38.0277C35.8611 111.228 33.9111 110.119 32.8277 108.246C31.7317 106.347 31.7189 104.078 32.815 102.166L52.7992 67.5762C53.8826 65.6772 55.8198 64.5556 58.012 64.5556C60.1914 64.5556 62.1414 65.6899 63.2247 67.589L83.1962 102.179C84.2668 104.04 84.2541 106.283 83.158 108.182Z" fill="white" />
                                    <path d="M57.2088 77.0206C55.6922 77.4539 54.749 78.8304 54.749 80.5C54.8255 81.5069 54.8892 82.5265 54.9657 83.5333C55.1824 87.3696 55.399 91.1294 55.6157 94.9657C55.6922 96.2657 56.699 97.2088 57.999 97.2088C59.299 97.2088 60.3186 96.2019 60.3823 94.8892C60.3823 94.099 60.3823 93.3725 60.4588 92.5696C60.599 90.1098 60.7519 87.65 60.8921 85.1902C60.9686 83.5971 61.1088 82.0039 61.1853 80.4108C61.1853 79.8373 61.1088 79.3275 60.8921 78.8177C60.2421 77.3902 58.7255 76.6638 57.2088 77.0206Z" fill="white" />
                                </g>
                                <g filter="url(#filter0_d_2788_1220)">
                                    <circle cx="58.1119" cy="88.2711" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                                </g>
                                <defs>
                                    <filter id="filter0_d_2788_1220" x="4.51101" y="36.8687" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                        <feOffset dy="2.19853" />
                                        <feGaussianBlur stdDeviation="1.46568" />
                                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2788_1220" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2788_1220" result="shape" />
                                    </filter>
                                    <linearGradient id="paint0_linear_2788_1220" x1="57.9499" y1="29.8984" x2="57.9499" y2="145.798" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#EA6A6A" />
                                        <stop offset="1" stop-color="#992C2C" />
                                    </linearGradient>
                                    <clipPath id="clip0_2788_1220">
                                        <rect width="62" height="62" fill="white" transform="translate(27 56.8984)" />
                                    </clipPath>
                                </defs>
                            </svg>                            {/* <div className="w-[80px] h-[80px] rounded-full bg-linear-to-b from-[#EF4444] to-[#B91C1C] flex items-center justify-center shadow-lg">
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
