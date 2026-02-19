import { Info } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom"

const RefundTransaction = () => {
    const { id } = useParams()
    const [selectedAction, setSelectedAction] = useState<"full" | "partial" | "manual">("full"); // Default to full or null

    // Mock data shared with TransactionDetail (ideally this should be in a shared store/api)
    const mockData = [
        {
            id: "1",
            fullName: "John Doe",
            client: { email: "john.doe@example.com" },
            licenseNo: "LIC-12345",
            plan: "TXN-2024-001",
            status: "Success",
            amount: "$100.00",
            createdAt: "2024-01-15T10:00:00",
            providerName: "John Doe",
            paymentStatus: "Success",
            phone: "+1 (555) 234-5678"
        },
        {
            id: "2",
            fullName: "Jane Smith",
            status: "Pending",
            plan: "TXN-2024-001",
            amount: "$100.00",
            createdAt: "2024-01-16T11:30:00",
            providerName: "Jane Smith",
            paymentStatus: "Pending",
            phone: "+1 (555) 987-6543"
        },
        {
            id: "3",
            fullName: "Alice Johnson",
            amount: "$300.00",
            client: { email: "alice.j@example.com" },
            status: "Failed",
            plan: "TXN-2024-001",
            createdAt: "2024-01-14T09:15:00",
            providerName: "Alice Provider",
            paymentStatus: "Failed",
            phone: "+1 (555) 111-2222"
        },
        {
            id: "4",
            plan: "TXN-2024-001",
            fullName: "Bob Brown",
            amount: "$400.00",
            client: { email: "bob.b@example.com" },
            status: "Refunded",
            createdAt: "2024-01-18T14:20:00",
            providerName: "Bob Provider",
            paymentStatus: "Refunded",
            phone: "+1 (555) 333-4444"
        }
    ];

    const transaction = mockData.find(t => t.id === id);

    if (!transaction) {
        return <div className="p-5">Transaction not found</div>;
    }

    return (
        <div className="flex flex-col p-5 gap-y-5">
            <p className='text-[24px] md:text-[32px] font-semibold mb-3'>Refund / Manual Adjustment</p>

            {/* Transaction Summary */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Transaction Summary</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Transaction ID</p>
                            <p className="text-[14px] font-medium">{transaction.plan || `TXN-2024-${transaction.id.padStart(6, '0')}`}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Provider Name</p>
                            <p className="text-[14px] font-medium">{transaction.providerName || "-"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Original Amount</p>
                            <p className="text-[18px] font-medium text-[var(--color-transaction-summary-ammont)]">{transaction.amount}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Full Name</p>
                            <p className="text-[16px] font-medium">{transaction.fullName}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Phone Number</p>
                            <p className="text-[16px] font-medium">{transaction.phone || "-"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Payment Status</p>
                            <div className="px-3 py-1 rounded-[5px] bg-[#E6F2F2] flex items-center justify-center">
                                <p className="text-[14px] text-[var(--color-transaction-summary-ammont)]">{transaction.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action selection */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Action Selection</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                        {/* Card 1 - Full Refund */}
                        <div
                            onClick={() => setSelectedAction("full")}
                            className={`w-full border-[3px] rounded-2xl min-h-[200px] flex flex-col items-center justify-center gap-y-1.5 p-4 cursor-pointer hover:shadow-md transition-shadow
                            ${selectedAction === "full" ? "border-[#65f3d7] bg-[#d5f9f2] bg-opacity-50" : "border-transparent bg-gray-50 opacity-60 hover:opacity-100"}`} // Highlight logic
                        >
                            <div className="w-[84px] h-[84px] rounded-xl bg-[#14B8A6] flex items-center flex-col justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                    <path d="M25.5 1.5L31.5 7.5L25.5 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 16.5V13.5C4.5 11.9087 5.13214 10.3826 6.25736 9.25736C7.38258 8.13214 8.9087 7.5 10.5 7.5H31.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.5 34.5L4.5 28.5L10.5 22.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M31.5 19.5V22.5C31.5 24.0913 30.8679 25.6174 29.7426 26.7426C28.6174 27.8679 27.0913 28.5 25.5 28.5H4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-[18px] md:text-[20px] font-medium text-black text-center">Full Refund</p>
                            <p className="text-[14px] md:text-[16px] text-[#666666] text-center">Refund the entire transaction amount</p>
                        </div>

                        {/* Card 2 - Partial Refund */}
                        <div
                            onClick={() => setSelectedAction("partial")}
                            className={`w-full min-h-[200px] border-[3px] rounded-2xl flex flex-col items-center justify-center gap-y-1.5 p-4 cursor-pointer hover:shadow-md transition-shadow
                             ${selectedAction === "partial" ? "bg-[#F2FBFE] border-[#A1CDFF]" : "border-transparent bg-gray-50 opacity-60 hover:opacity-100"}`}
                        >
                            <div className="w-[84px] h-[84px] rounded-xl bg-[#4494EF] flex items-center flex-col justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                    <path d="M28.5 7.5L7.5 28.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.75 13.5C11.8211 13.5 13.5 11.8211 13.5 9.75C13.5 7.67893 11.8211 6 9.75 6C7.67893 6 6 7.67893 6 9.75C6 11.8211 7.67893 13.5 9.75 13.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M26.25 30C28.3211 30 30 28.3211 30 26.25C30 24.1789 28.3211 22.5 26.25 22.5C24.1789 22.5 22.5 24.1789 22.5 26.25C22.5 28.3211 24.1789 30 26.25 30Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-[18px] md:text-[20px] font-medium text-black text-center">Partial Refund</p>
                            <p className="text-[14px] md:text-[16px] text-[#666666] text-center">Refund a portion of the transaction</p>
                        </div>

                        {/* Card 3 - Manual Adjust */}
                        <div
                            onClick={() => setSelectedAction("manual")}
                            className={`w-full min-h-[200px] border-[3px] rounded-2xl flex flex-col items-center justify-center gap-y-1.5 p-4 cursor-pointer hover:shadow-md transition-shadow
                            ${selectedAction === "manual" ? "bg-[#FEF2F9] border-[#FFC3F9]" : "border-transparent bg-gray-50 opacity-60 hover:opacity-100"}`}
                        >
                            <div className="w-[84px] h-[84px] rounded-xl bg-[#EF449F] flex items-center flex-col justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                    <path d="M25.5 1.5L31.5 7.5L25.5 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 16.5V13.5C4.5 11.9087 5.13214 10.3826 6.25736 9.25736C7.38258 8.13214 8.9087 7.5 10.5 7.5H31.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.5 34.5L4.5 28.5L10.5 22.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M31.5 19.5V22.5C31.5 24.0913 30.8679 25.6174 29.7426 26.7426C28.6174 27.8679 27.0913 28.5 25.5 28.5H4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-[18px] md:text-[20px] font-medium text-black text-center">Manual Adjust</p>
                            <p className="text-[14px] md:text-[16px] text-[#666666] text-center">Adjust account balance manually</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amount and reason input  */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg  font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full gap-y-3    ">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Amount & Reason Input</p>
                    <div className="flex flex-col gap-y-5 w-full">
                        <div className="w-full h-[114px] flex flex-col items-start p-4  border-[#E2E8F0] border-[1px] bg-[#F0F2F3] rounded-lg">
                            <p className="text-[14px] font-medium">Refunded Amount</p>
                            <p className="text-[24px] font-bold">{transaction?.amount}</p>
                            <p className="text-[12px] font-normal text-[var(--color-transaction-summary-text)]">Full transaction amount will be refunded</p>
                        </div>
                        {/* Refund the user */}
                        <div className="flex flex-col gap-y-2" >
                            <label htmlFor="refundUser" className="text-[14px] font-medium">Refund the user <span className="text-[#FF0000]">*</span></label>
                            <textarea
                                id="refundUser"
                                maxLength={500}
                                rows={3}
                                className="w-full border-[#E2E2E2] border-[1px] rounded-lg p-2 resize-none focus:outline-none focus:border-primaryColorDark"
                                placeholder="Provide a detailed explanation for this action. This will be recorded in the transaction history."
                            />

                            {/* info icon */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-x-1 align-middle">
                                    <Info size={15} className="text-[var(--color-transaction-summary-text)]" />
                                    <p className="text-[12px] font-normal text-[var(--color-transaction-summary-text)]">This reason will be permanently recorded and cannot be edited later</p>
                                </div>
                                <p className="text-[12px] font-normal text-black">500 characters remaining</p>
                            </div>
                        </div>

                        {/* Warning Section */}
                        {selectedAction === "full" && (
                            <div className="bg-[#FFFBEB] w-full min-h-[170px] rounded-md p-4 pt-6 flex flex-col">
                                <div className="flex flex-row items-center align-middle gap-2">
                                    <Info size={24} className="text-[#D97706]" />
                                    <p className="text-[16px] font-medium text-[#78350F]">Full Refund Warning</p>
                                </div>
                                <div className="flex flex-col gap-2 mt-2 ml-6">
                                    <ul className="list-disc gap-y-2 pl-4">
                                        <li className="text-[14px] font-normal text-[#78350F]">The entire transaction amount will be returned to the customer.</li>
                                        <li className="text-[14px] font-normal text-[#78350F]">This action is permanent and cannot be reversed.</li>
                                        <li className="text-[14px] font-normal text-[#78350F]">The transaction status will be updated to "Refunded"</li>
                                        <li className="text-[14px] font-normal text-[#78350F]">All associated fees and charges will be processed accordingly</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-row items-center justify-end gap-x-2">
                            <button className="border-[#2C9993] border-[1px] text-[#2C9993] cursor-pointer hover:text-white hover:bg-[#2C9993] px-4 py-2 rounded-lg">Cancel</button>
                            <button className="bg-[#2C9993] text-white cursor-pointer hover:text-white hover:bg-[#2C9993] px-4 py-2 rounded-lg">Confirm Refund</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RefundTransaction