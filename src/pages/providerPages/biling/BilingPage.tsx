
import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import Table from "../../../components/table/Table"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import { GoDotFill } from "react-icons/go"
import ViewIcon from "../../../components/icons/view/View"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { ChevronDown } from "lucide-react"
import InvoiceModal from "../../../components/modals/InvoiceModal"
import { subscriptionApiService } from "../../../services/subscriptionApiService"


const BilingHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const totalPages = 5;

    // Fetch Payments
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await subscriptionApiService.getAllPayments();
                setPayments(response || []);
                console.log(response, "Response of payments");
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const heading = [
        "Invoice No",
        "Date",
        "Amount",
        "Status",
        "Action",
    ];

    const filterOptions = ["All", "paid", "pending", "overdue", "canceled"];

    const filteredRecords = payments.filter((record) => {
        const matchesSearch = record.billTo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = activeFilter === "All" || record.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "overdue": return "bg-red-100 text-red-700";
            case "canceled": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
    };

    // Find full invoice object for the modal
    const selectedInvoiceData = payments.find(p => p.id === selectedInvoiceId);

    return (
        <OutletLayout heading="Invoice History">
            <p className="text-[20px] font-medium text-[#666666] mt-[-35px]" > View and manage all your invoices in one place</p>
            <div className="flex flex-row md:flex-row items-center  rounded-[8px] border-[#E5E7EB] border-2 h-[169px] gap-4 my-6 pl-2">
                <div className="w-1/2 flex flex-col items-start justify-evenly p-2">
                    <p className="text-[20px] font-medium ">Filters</p>
                    <label htmlFor="Date-Range">Date Range</label>
                    <div className="relative w-full mt-2">
                        <select id="Date-Range" className="w-full h-[60px] bg-inputBgColor rounded-md px-3 outline-none appearance-none cursor-pointer">
                            <option value="">All Time</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                            <option value="Last 60 Days">Last 60 Days</option>
                            <option value="Last 90 Days">Last 90 Days</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" size={24} />
                    </div>
                </div>
                <div className="w-1/2 flex flex-col items-start justify-end mt-8 p-3">
                    <label htmlFor="Status-Dropdown">Status</label>
                    <div className="relative w-full mt-2">
                        <select
                            id="Status-Dropdown"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="w-full h-[60px] bg-inputBgColor rounded-md px-3 outline-none appearance-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                            <option value="canceled">Canceled</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" size={24} />
                    </div>
                </div>
            </div>

            <Table heading={heading} >
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading invoices...</td></tr>
                ) : filteredRecords.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No invoices found.</td></tr>
                ) : (
                    filteredRecords.map((data: any, idx: number) => (
                        <tr
                            key={data?.id ?? idx}
                            className="border-b border-b-solid border-b-lightGreyColor"
                        >
                            {/* Invoice No */}
                            <td className="px-2 py-3 align-middle">
                                <div className="flex items-center gap-x-4">
                                    <span className="uppercase text-[#2C9993] font-medium">{data.invoiceNo}</span>
                                </div>
                            </td>

                            {/* Date */}
                            <td className="px-2 py-3 align-middle whitespace-nowrap">
                                {data.date}
                            </td>

                            <td className="px-2 py-3 align-middle whitespace-nowrap">
                                {data.amount}
                            </td>

                            <td className="px-2 py-3 align-middle whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                >
                                    <GoDotFill
                                        className="text-base"
                                    />
                                    {data.status}
                                </span>
                            </td>


                            <td className="px-2 py-3 align-middle whitespace-nowrap">
                                <div className="flex items-center justify-start gap-x-2">
                                    <ViewIcon
                                        onClick={() => {
                                            setSelectedInvoiceId(data.id);
                                            setShowInvoiceModal(true);
                                        }}
                                    />
                                    {/* Download logic can be added later or reusing InvoiceModal's download */}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </Table>

            <CustomPagination
                totalPages={totalPages}
                onPageChange={onPageChange}
                hookCurrentPage={currentPage}
            />

            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                invoiceId={selectedInvoiceId}
                invoiceData={selectedInvoiceData}
            />
        </OutletLayout>
    )
}

export default BilingHistory