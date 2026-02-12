import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentOverDueModalProps {
    onClose?: () => void;
}

const PaymentOverDueModal: React.FC<PaymentOverDueModalProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    const handleViewInvoice = () => {
        navigate('/invoice');
        onClose?.();
    }

    const handleUpdatePayment = () => {
        navigate('/payment');
        onClose?.();
    }

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
                    <div className="mb-6 mt-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                            <circle cx="57.9499" cy="57.9499" r="57.9499" fill="url(#paint0_linear_2674_3151)" />
                            <path d="M58.0002 29.084C50.4636 29.084 43.2357 32.0779 37.9065 37.407C32.5774 42.7362 29.5835 49.9641 29.5835 57.5007C29.5835 58.1858 29.8557 58.8429 30.3401 59.3273C30.8246 59.8118 31.4817 60.084 32.1668 60.084C32.852 60.084 33.5091 59.8118 33.9935 59.3273C34.478 58.8429 34.7502 58.1858 34.7502 57.5007C34.7742 52.8071 36.2183 48.2307 38.8924 44.3733C41.5666 40.5159 45.3456 37.5583 49.7325 35.8893C54.1194 34.2203 58.9087 33.9182 63.4706 35.0226C68.0325 36.127 72.1533 38.5863 75.291 42.077C78.4287 45.5677 80.4365 49.9263 81.0502 54.5796C81.664 59.233 80.8549 63.9631 78.7295 68.148C76.6041 72.3328 73.2619 75.7764 69.1423 78.0258C65.0228 80.2753 60.3189 81.2252 55.6493 80.7506C55.3098 80.7187 54.9673 80.7543 54.6417 80.8554C54.316 80.9564 54.0135 81.121 53.7517 81.3395C53.49 81.5581 53.2741 81.8263 53.1165 82.1287C52.9589 82.4311 52.8627 82.7617 52.8335 83.1015C52.8016 83.441 52.8371 83.7835 52.9382 84.1092C53.0393 84.4348 53.2038 84.7373 53.4224 84.9991C53.6409 85.2608 53.9091 85.4768 54.2115 85.6344C54.514 85.792 54.8446 85.8881 55.1843 85.9173C56.1143 85.9173 57.0443 86.0465 58.0002 86.0465C65.5539 86.0465 72.7982 83.0458 78.1394 77.7045C83.4807 72.3632 86.4814 65.1189 86.4814 57.5652C86.4814 50.0115 83.4807 42.7672 78.1394 37.4259C72.7982 32.0847 65.5539 29.084 58.0002 29.084Z" fill="white" />
                            <path d="M58.0002 39.417C57.3151 39.417 56.658 39.6892 56.1735 40.1736C55.689 40.6581 55.4169 41.3152 55.4169 42.0003V57.5003C55.4169 58.1855 55.689 58.8425 56.1735 59.327C56.658 59.8115 57.3151 60.0837 58.0002 60.0837H68.3335C69.0187 60.0837 69.6758 59.8115 70.1602 59.327C70.6447 58.8425 70.9169 58.1855 70.9169 57.5003C70.9169 56.8152 70.6447 56.1581 70.1602 55.6736C69.6758 55.1892 69.0187 54.917 68.3335 54.917H60.5835V42.0003C60.5835 41.3152 60.3114 40.6581 59.8269 40.1736C59.3424 39.6892 58.6853 39.417 58.0002 39.417ZM45.0835 70.417V60.0837C45.0835 59.3985 44.8114 58.7414 44.3269 58.257C43.8424 57.7725 43.1853 57.5003 42.5002 57.5003C41.8151 57.5003 41.158 57.7725 40.6735 58.257C40.189 58.7414 39.9169 59.3985 39.9169 60.0837V70.417C39.9169 71.1021 40.189 71.7592 40.6735 72.2437C41.158 72.7282 41.8151 73.0003 42.5002 73.0003C43.1853 73.0003 43.8424 72.7282 44.3269 72.2437C44.8114 71.7592 45.0835 71.1021 45.0835 70.417Z" fill="white" />
                            <path d="M42.5002 85.917C44.6403 85.917 46.3752 84.1821 46.3752 82.042C46.3752 79.9019 44.6403 78.167 42.5002 78.167C40.3601 78.167 38.6252 79.9019 38.6252 82.042C38.6252 84.1821 40.3601 85.917 42.5002 85.917Z" fill="white" />
                            <g filter="url(#filter0_d_2674_3151)">
                                <circle cx="58.112" cy="58.3726" r="49.9367" stroke="white" stroke-opacity="0.7" stroke-width="1.46568" />
                            </g>
                            <defs>
                                <filter id="filter0_d_2674_3151" x="4.51114" y="6.97028" width="107.202" height="107.202" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="2.19853" />
                                    <feGaussianBlur stdDeviation="1.46568" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2674_3151" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2674_3151" result="shape" />
                                </filter>
                                <linearGradient id="paint0_linear_2674_3151" x1="57.9499" y1="0" x2="57.9499" y2="115.9" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#EAC16A" />
                                    <stop offset="1" stop-color="#E47D00" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>


                    <h2 className="text-[24px] font-semibold text-[#101828] font-[Poppins] mb-1 text-center">
                        Payment Overdue
                    </h2>
                    <p className="text-[16px] text-[#667085] font-normal font-[Poppins] mb-8 text-center">
                        Your payment of $49.99 is overdue. Please update your payment method to continue enjoying Your payment of $49.99 is overdue. Please update your payment method to continue enjoying       Get access to everything you need to succeed
                    </p>
                    {/* Footer Buttons */}
                    <div className="flex flex-row gap-6 w-full mt-auto">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[76px] border-2 border-[#E2E8F0] text-[#101828] rounded-[20px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-gray-50 transition-all"
                        >
                            View Invoice                        </button>
                        <button
                            onClick={handleUpdatePayment}
                            className="flex-1 h-[76px] bg-[#2C9993] text-white rounded-[20px] font-medium text-[20px] font-[Poppins] cursor-pointer hover:bg-[#2C9993]/90 transition-all shadow-xl"
                        >
                            Update Payment Method
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentOverDueModal;
