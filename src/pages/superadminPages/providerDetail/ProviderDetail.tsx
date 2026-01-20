import { Calendar, Clock, File, FilePenLine, FileText, Info, Trash } from "lucide-react";
import { useParams } from "react-router-dom"
import profileImage from "../../../../public/assets/profile-img.png"
const ProviderDetail = () => {
    const { id } = useParams()

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

            {/* User Details */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-row items-start justify-between w-full">
                    <p className='text-[24px] md:text-[32px] font-semibold mb-3'>Provider Details</p>
                    <div className="flex flex-row items-center gap-x-2">
                        <button className="w-[114px] h-[38px] bg-white border-[1px] cursor-pointer border-[#2C9993] rounded-lg flex items-center justify-center gap-x-2">
                            <span className="text-[16px] font-medium text-[#2C9993]">Delete</span>
                            <Trash className="w-[20px] h-[20px] text-[#2C9993] " />
                        </button>
                        <button className="w-[114px] h-[38px] bg-white border-[1px] cursor-pointer   border-[#2C9993] rounded-lg flex items-center justify-center gap-x-2">
                            <span className="text-[16px] font-medium text-[#2C9993]">Edit</span>
                            <FilePenLine className="w-[20px] h-[20px] text-[#2C9993] " />
                        </button>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-x-3 w-full">
                    <div
                        className="w-[139px] h-[139px] rounded-full border-[3px] border-[#FFC600] flex items-center justify-center"
                    >
                        <img src={profileImage} className="w-full h-full object-cover rounded-full" alt="" />

                    </div>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className="font-[Poppins] text-[20px] md:text-[24px] font-semibold">Sarah Johnson</p>
                        <p className="font-[Poppins]  font-[14px] text-[#666666]">sarah.j@healthcare.com</p>
                        <div className="flex flex-row items-start gap-x-2">
                            <div className="w-[80px] h-[26px] rounded-[4px] bg-[#FAF5FF] flex items-center justify-center">
                                <p className="font-[Poppins] text-[12px] font-medium text-[#9D27B0]">Enterprise</p>
                            </div>
                            <div className="w-[80px] h-[26px] rounded-[4px] bg-[#ECFDF5] flex items-center justify-center">
                                <p className="font-[Poppins] text-[12px] font-medium text-[#047857]">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Contact Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">License No </p>
                            <p className="text-[14px] font-medium">{transaction.licenseNo || `TXN-2024-${transaction.id.padStart(6, '0')}`}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Provider Name</p>
                            <p className="text-[14px] font-medium">{transaction.providerName || "N/A"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Total Revenue</p>
                            <p className="text-[18px] font-medium text-[var(--color-transaction-summary-ammont)]">{transaction.amount}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Full Name</p>
                            <p className="text-[16px] font-medium">{transaction.fullName}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Phone Number</p>
                            <p className="text-[16px] font-medium">{transaction.phone || "N/A"}</p>
                        </div>


                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Outstanding Amount</p>
                            <p className="text-[16px] font-medium">{transaction.outstandingAmount || "$0.00"}</p>
                        </div>


                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Speciality </p>
                            <p className="text-[16px] font-medium">{transaction.speciality || "Cardiology"}</p>
                        </div>

                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Oragnization</p>
                            <p className="text-[16px] font-medium">{transaction.organization || "Metropolitan Heart Center"}</p>
                        </div>

                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-[var(--color-transaction-summary-text)]">Payment Method</p>
                            <p className="text-[16px] font-medium">{transaction.paymentMethod || "Credit Card **** 1234"}</p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-[#E2E8F0]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="w-full h-[72px] bg-linear-to-b from-[#ECFDF5] to-[#F0FDF4] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#059669] flex items-center justify-center">
                            <Calendar className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-[var(--color-transaction-summary-text)]">Member Since</p>
                            <p className="text-[12px] font-bold ">Mar 2023</p>
                        </div>

                    </div>

                    <div className="w-full h-[72px] bg-linear-to-b from-[#EFF6FF] to-[#EEF2FF] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#4F46E5] flex items-center justify-center">
                            <Clock className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-[var(--color-transaction-summary-text)]">Last Payment</p>
                            <p className="text-[12px] font-bold ">Dec 15</p>
                        </div>

                    </div>

                    <div className="w-full h-[72px] bg-linear-to-b from-[#FFFBEB] to-[#FFF7ED] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#D97706] flex items-center justify-center">
                            <FileText className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-[var(--color-transaction-summary-text)]">Total Invoices</p>
                            <p className="text-[12px] font-bold ">24</p>
                        </div>

                    </div>
                </div>
            </div>
            {/* Amount and reason input  */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-lg  font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full gap-y-3    ">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Customer Plan Details</p>
                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-1/3 h-[293px] rounded-[12px] pt-4 pb-4 pl-4 pr-4 bg-[#2C9993]">
                            <div className="flex items-start justify-between">
                                <p className="text-[14px] text-white font-medium">Current Plan</p>
                                <div className="w-[91px] h-[24px] rounded-[12px] bg-white/20 flex items-center justify-center">
                                    <p className="text-[12px] text-white z-20 font-medium">Enterprise</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <p className="text-[14px] font-medium">Plan Price</p>
                            <p className="text-[16px] font-medium">{transaction?.planPrice}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProviderDetail