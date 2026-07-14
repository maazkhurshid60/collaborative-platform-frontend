import React from 'react';
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Table from "../../table/Table";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface GenericLockedPageProps {
   heading: string;
   columns?: string[];
   label?: string;
   button?: React.ReactNode;
}

const GenericLockedPage: React.FC<GenericLockedPageProps> = ({ heading, columns = ["#", "Name", "Detail", "Status", "Action"], label, button }) => {
    const navigate = useNavigate();

    return (
        <OutletLayout heading={heading} button={button}>
            <div className="relative group overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-sm mt-6 min-h-[600px] w-full">
                {/* The Mock UI Structure (Blurred) */}
                <div className="blur-[6px] opacity-25 select-none pointer-events-none transition-all duration-500 w-full h-full absolute inset-0">
                    <div className="flex items-center justify-end mt-6 px-4">
                        <div className="w-[40%] bg-gray-100 h-10 rounded-md border border-gray-200"></div>
                    </div>
                    <div className="mt-10 w-full px-4 overflow-hidden">
                        <Table heading={columns}>
                            {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                                <tr key={idx} className="border-b border-b-solid border-b-lightGreyColor h-14 bg-gray-50/50">
                                   {columns.map((_, i) => (
                                       <td key={i} className="px-2 py-3">
                                           <div className={`h-4 bg-gray-200 rounded-sm w-${Math.floor(Math.random() * 4) + 16}`}></div>
                                       </td>
                                   ))}
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>

                {/* Professional Industrial Overlay */}
                <div className="absolute inset-0 z-10 bg-slate-50/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-t-2 border-transparent group-hover:border-primaryColor">
                    <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-5">
                            <Lock size={28} className="text-primaryColorDark" />
                        </div>

                        <h3 className="text-[22px] font-bold text-gray-900 mb-2 font-[Montserrat] tracking-tight">Access Locked</h3>
                        <p className="text-gray-500 mb-8 font-[Poppins] text-[15px] leading-relaxed">
                            {label || "Required subscription plan is inactive. Please renew to access this module."}
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

export default GenericLockedPage;
