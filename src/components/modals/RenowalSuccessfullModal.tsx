import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface RenewalSuccessfullModalProps {
    onClose?: () => void;
}

const RenewalSuccessfullModal: React.FC<RenewalSuccessfullModalProps> = ({ onClose }) => {
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="216" height="191" viewBox="0 0 216 191" fill="none">
                            <path d="M181.711 39.7909C187.985 40.4009 201.109 38.3791 203.41 25.4122C205.71 12.4453 211.863 8.85495 214.651 8.68066" stroke="#F3603F" stroke-width="2.37992" stroke-linecap="round" />
                            <path d="M172.962 155.415C178.819 157.107 190.141 163.535 188.579 175.716" stroke="#F7B23B" stroke-width="2.37992" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M1.19043 138.225C10.1772 141.61 29.5512 144.038 35.1534 126.671M35.1534 126.671C35.9704 121.886 35.1535 112.421 25.3498 112.841C23.4824 117.451 22.8287 126.671 35.1534 126.671ZM35.1534 126.671C39.2383 127.43 48.7387 126.706 54.0607 117.743" stroke="#6E89FA" stroke-width="2.37992" stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="143.804" cy="184.624" r="6.01292" fill="#637BFE" />
                            <circle cx="200.649" cy="89.4055" r="5.61627" stroke="#C05EFD" stroke-width="0.793307" />
                            <circle cx="105.197" cy="6.58466" r="6.58466" fill="url(#paint0_linear_2676_4137)" />
                            <circle cx="123.893" cy="17.6991" r="3.47742" fill="#F3603F" />
                            <circle cx="47.2494" cy="68.768" r="5.69748" stroke="#F7B23B" stroke-width="0.793307" />
                            <circle cx="61.2474" cy="164.861" r="6.30432" stroke="url(#paint1_linear_2676_4137)" stroke-width="0.793307" />
                            <circle cx="3.20131" cy="3.20131" r="3.20131" transform="matrix(-1 0 0 1 128.309 174.527)" fill="url(#paint2_linear_2676_4137)" />
                            <circle cx="125.8" cy="95.4988" r="62.7312" fill="url(#paint3_linear_2676_4137)" />
                            <g filter="url(#filter0_d_2676_4137)">
                                <circle cx="125.8" cy="95.4986" r="54.0568" stroke="white" stroke-opacity="0.7" stroke-width="1.58661" />
                            </g>
                            <path d="M153.677 81.7746C153.677 83.4827 153.007 85.1319 151.788 86.3099L123.454 113.757C122.174 114.935 120.468 115.642 118.701 115.642C116.934 115.642 115.228 114.935 114.009 113.757L99.8118 100.034C98.5931 98.8557 97.9229 97.2064 97.9229 95.4983C97.9229 93.7902 98.6541 92.1999 99.8727 90.963C101.152 89.785 102.798 89.1371 104.565 89.0782C106.332 89.0782 107.977 89.7261 109.256 90.9041L118.701 100.034L142.343 77.1804C143.623 76.0024 145.268 75.3545 147.035 75.3545C148.802 75.4134 150.448 76.0613 151.727 77.2982C152.946 78.4762 153.677 80.0665 153.677 81.7746Z" fill="white" />
                            <defs>
                                <filter id="filter0_d_2676_4137" x="67.777" y="39.8551" width="116.047" height="116.047" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="2.37992" />
                                    <feGaussianBlur stdDeviation="1.58661" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2676_4137" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2676_4137" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_2676_4137" x1="98.6128" y1="6.58466" x2="111.782" y2="6.58466" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_2676_4137" x1="54.5464" y1="164.861" x2="67.9483" y2="164.861" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_2676_4137" x1="0" y1="3.20131" x2="6.40262" y2="3.20131" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FACC15" />
                                    <stop offset="1" stop-color="#F97316" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_2676_4137" x1="125.8" y1="32.7676" x2="125.8" y2="158.23" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#B9EA6A" />
                                    <stop offset="1" stop-color="#2C9993" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>


                    <h2 className="text-[24px] font-semibold text-[#101828] font-[Poppins] mb-1 text-center">
                        Renewal Successful
                    </h2>
                    <p className="text-[16px] text-[#667085] font-normal font-[Poppins] mb-8 text-center">
                        Your subscription has been successfully renewed. Thank you for continuing with us! Your next billing date is March 15, 2025.
                    </p>
                    {/* Footer Buttons */}
                    <div className="flex flex-row gap-6 w-full mt-auto">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] border-2 border-[#E2E8F0] text-[#101828] rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-gray-50 transition-all"
                        >
                            Manage Subscription
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[60px] bg-[#2C9993] text-white rounded-[10px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-xl"
                        >
                            View Receipt

                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RenewalSuccessfullModal;
