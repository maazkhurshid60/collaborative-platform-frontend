import React from 'react';
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HiOutlineUserAdd } from "react-icons/hi";
import { MdOutlineMail } from "react-icons/md";

const DummyChatPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <OutletLayout isWhiteColor={false}>
            <div className="relative group overflow-hidden rounded-[10px] w-full h-[80vh]">

                {/* The Mock UI Structure (Blurred) */}
                <div className="blur-[6px] opacity-25 select-none pointer-events-none transition-all duration-500 w-full h-full flex items-start lg:justify-between absolute inset-0">

                    {/* Left Sidebar */}
                    <div className="w-full border-r h-full border-r-solid border-r-inputBgColor p-4 lg:w-[35%] xl:w-[25%] bg-white rounded-l-[10px] relative z-30">
                        <div className='flex items-center justify-between'>
                            <p className="font-medium text-[14px] text-textGreyColor bg-gray-200 h-4 w-24 rounded-sm"></p>
                            <div className='flex items-center gap-3'>
                                <HiOutlineUserAdd className='text-xl text-gray-300' />
                                <MdOutlineMail className='text-xl text-gray-300' />
                            </div>
                        </div>

                        {/* Recent Chats Skelton */}
                        <div className="min-h-[31vh] max-h-[31vh] overflow-auto mt-4 space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-x-3 items-center w-full p-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 w-full rounded-sm"></div>
                                        <div className="h-2 bg-gray-200 w-1/2 rounded-sm"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="w-full h-px text-inputBgColor my-2 bg-gray-200" />

                        {/* Group Chats Skeleton */}
                        <div className='flex items-center justify-between mt-4'>
                            <p className="font-medium text-[14px] text-textGreyColor bg-gray-200 h-4 w-24 rounded-sm"></p>
                            <HiOutlineUserAdd className='text-xl text-gray-300' />
                        </div>
                        <div className="min-h-[32vh] max-h-[32vh] overflow-auto mt-4 space-y-4">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex gap-x-3 items-center w-full p-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 w-full rounded-sm"></div>
                                        <div className="h-2 bg-gray-200 w-1/2 rounded-sm"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Message Area */}
                    <div className="w-full lg:w-[65%] xl:w-[74.5%] bg-white h-[80vh] rounded-r-[10px] flex items-center justify-center p-8">
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-32 h-32 opacity-70 mb-4 bg-gray-200 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-gray-300 bg-gray-200 h-6 w-32 rounded-sm mb-2"></h2>
                            <p className="text-gray-200 mt-2 text-sm bg-gray-100 h-4 w-48 rounded-sm"></p>
                        </div>
                    </div>
                </div>

                {/* Professional Industrial Overlay */}
                <div className="absolute inset-0 z-40 bg-slate-50/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-t-2 border-transparent group-hover:border-primaryColor">
                    <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-5">
                            <Lock size={28} className="text-primaryColorDark" />
                        </div>

                        <h3 className="text-[22px] font-bold text-gray-900 mb-2 font-[Montserrat] tracking-tight">Chat Locked</h3>
                        <p className="text-gray-500 mb-8 font-[Poppins] text-[15px] leading-relaxed">
                            Access to the communications suite is currently locked due to an inactive subscription. Please renew to continue messaging.
                        </p>

                        <button
                            onClick={() => navigate('/select-plan')}
                            className="bg-primaryColorDark w-full text-white px-8 py-3 rounded-lg text-[15px] font-bold font-[Poppins] hover:bg-[#0B786B] transition-all shadow-md active:shadow-inner cursor-pointer"
                        >
                            View Subscription Plans
                        </button>
                    </div>
                </div>

            </div>
        </OutletLayout>
    );
};

export default DummyChatPage;
