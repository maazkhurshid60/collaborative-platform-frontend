import { FileText, Search } from "lucide-react";

const NoBillingHistory = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 bg-[#2C9993]/5 rounded-full animate-pulse blur-xl" />
        <div className="absolute inset-0 bg-[#F0FDF4] rounded-full flex items-center justify-center shadow-inner">
          <FileText className="w-14 h-14 text-[#2C9993] opacity-80" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center animate-bounce duration-3000">
          <Search className="w-5 h-5 text-[#2C9993]" />
        </div>
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center animate-pulse">
          <span className="text-[#2C9993] text-[12px] font-bold">$</span>
        </div>
        <div className="absolute -bottom-2 right-4 w-6 h-6 bg-[#2C9993] rounded-full border-2 border-white animate-[ping_3s_linear_infinite]" />
      </div>
      <h3 className="text-[20px] font-bold text-[#101828] mb-2 font-[Poppins]">
        No Billing History
      </h3>
      <p className="text-[16px] text-[#667085] max-w-70 font-normal font-[Poppins]">
        Once you start your subscription, your receipts and invoices will appear
        here.
      </p>
    </div>
  );
};
export default NoBillingHistory;
