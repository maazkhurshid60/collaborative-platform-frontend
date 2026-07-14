import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface UnlockPremiumModalProps {
    onClose?: () => void;
}

const UnlockPremiumModal: React.FC<UnlockPremiumModalProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    const features = [
        "Unlimited customers",
        "Custom billing workflows",
        "Dedicated account manager",
        "White-label options",
        "Custom integrations",
        "Advanced security & compliance"
    ];

    return (
        <div
            className="fixed inset-0 bg-textColor/70 z-50 overflow-y-auto p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div className="flex min-h-full items-center justify-center">
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

                    {/* Header Icon */}
                    <div className="mb-6 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                            <circle cx="57.9499" cy="57.9499" r="57.9499" fill="url(#paint0_linear_premium)" />
                            <path d="M30.0282 68.5761L26.1501 43.3693C26.087 42.9564 26.1483 42.5341 26.3261 42.1562C26.5038 41.7782 26.7901 41.4617 27.1484 41.247C27.5066 41.0323 27.9207 40.9292 28.3378 40.9506C28.755 40.9721 29.1563 41.1172 29.4906 41.3676L41.5734 50.4286C41.8873 50.6641 42.246 50.8332 42.6276 50.9254C43.0091 51.0176 43.4054 51.0309 43.7923 50.9647C44.1792 50.8985 44.5485 50.754 44.8776 50.5402C45.2067 50.3263 45.4888 50.0475 45.7065 49.7209L55.7662 34.6249C56.0115 34.2581 56.3434 33.9574 56.7326 33.7494C57.1217 33.5414 57.5562 33.4326 57.9975 33.4326C58.4388 33.4326 58.8732 33.5414 59.2624 33.7494C59.6516 33.9574 59.9835 34.2581 60.2287 34.6249L70.2885 49.7124C70.5062 50.039 70.7882 50.3178 71.1174 50.5317C71.4465 50.7455 71.8158 50.89 72.2027 50.9562C72.5896 51.0224 72.9859 51.0091 73.3674 50.9169C73.7489 50.8247 74.1077 50.6556 74.4216 50.4201L86.5044 41.3591C86.8387 41.1087 87.24 40.9636 87.6571 40.9421C88.0743 40.9207 88.4883 41.0238 88.8466 41.2385C89.2049 41.4532 89.4911 41.7697 89.6689 42.1477C89.8467 42.5256 89.9079 42.9479 89.8449 43.3608L85.9667 68.5676L30.0282 68.5761ZM30.0282 73.2383H85.971V79.6452C85.971 80.0283 85.8955 80.4077 85.7489 80.7617C85.6023 81.1157 85.3874 81.4373 85.1164 81.7083C84.8455 81.9792 84.5239 82.1941 84.1699 82.3407C83.8159 82.4874 83.4365 82.5628 83.0534 82.5628H32.9459C32.5627 82.5628 32.1833 82.4874 31.8293 82.3407C31.4753 82.1941 31.1537 81.9792 30.8828 81.7083C30.3356 81.1611 30.0282 80.419 30.0282 79.6452V73.2383Z" fill="white" />
                            <g filter="url(#filter0_d_premium)">
                                <circle cx="58.1119" cy="58.3726" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                            </g>
                            <defs>
                                <filter id="filter0_d_premium" x="4.51101" y="6.97028" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="2.19853" />
                                    <feGaussianBlur stdDeviation="1.46568" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_premium" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_premium" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_premium" x1="57.9499" y1="0" x2="57.9499" y2="115.9" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#B9EA6A" />
                                    <stop offset="1" stopColor="#2C9993" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2 className="text-[32px] font-bold text-[#101828] font-[Poppins] mb-1 text-center">
                        Unlock Premium Features
                    </h2>
                    <p className="text-[18px] text-[#667085] font-[Poppins] mb-8 text-center">
                        Get access to everything you need to succeed
                    </p>

                    {/* Features Section */}
                    <div className="w-full bg-[#F9FAFB] rounded-[24px] p-8 mb-8">
                        <ul className="grid grid-cols-1 gap-y-4">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-x-5">
                                    <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                                        <Check size={28} className="text-[#2C9993]" />
                                    </div>
                                    <span className="text-[20px] text-[#475467] font-[Poppins]">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pricing Section */}
                    <div className="w-full bg-[#F0FDFB] border border-[#CCFBEF] rounded-[32px] p-8 mb-10 flex flex-col items-center">
                        <div className="flex items-baseline gap-x-2 mb-2">
                            <span className="text-[64px] font-bold text-[#101828] font-[Poppins]">$29</span>
                            <span className="text-[24px] text-[#667085] font-[Poppins]">/month</span>
                        </div>
                        <p className="text-[18px] text-[#667085] font-[Poppins] mb-6">
                            Billed monthly • Cancel anytime
                        </p>
                        <div className="w-full h-[1.5px] bg-[#CCFBEF] mb-6" />
                        <div className="flex items-center gap-x-3 text-[#2C9993] font-semibold text-[18px]">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2L3 5V10C3 14.4183 6.13401 18.2939 10 19C13.866 18.2939 17 14.4183 17 10V5L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 10.5L9 12.5L13 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            30-day money-back guarantee
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex flex-row gap-6 w-full mt-auto">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[76px] border-2 border-[#E2E8F0] text-[#101828] rounded-[20px] font-bold text-[22px] font-[Poppins] cursor-pointer hover:bg-gray-50 transition-all"
                        >
                            Maybe Later
                        </button>
                        <button
                            className="flex-1 h-[76px] bg-[#2C9993] text-white rounded-[20px] font-bold text-[22px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-xl"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnlockPremiumModal;
