
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
import DownloadIcon from "../../../components/icons/download/Download"
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf"
import { subscriptionApiService } from "../../../services/subscriptionApiService"


const ITEMS_PER_PAGE = 8;

const BilingHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [dateRange, setDateRange] = useState("");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all payments once
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await subscriptionApiService.getAllPayments();
                setPayments(response || []);
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    // Reset to page 1 whenever filters change
    useEffect(() => { setCurrentPage(1); }, [activeFilter, dateRange, searchTerm]);

    const onPageChange = (page: number) => setCurrentPage(page);

    // Compute the cutoff date for the selected date range
    const getDateCutoff = (): Date | null => {
        const now = new Date();
        switch (dateRange) {
            case "7": return new Date(now.setDate(now.getDate() - 7));
            case "30": return new Date(now.setDate(now.getDate() - 30));
            case "60": return new Date(now.setDate(now.getDate() - 60));
            case "90": return new Date(now.setDate(now.getDate() - 90));
            default: return null; // "All Time" — no cutoff
        }
    };

    const heading = ["Invoice No", "Date", "Amount", "Status", "Actions"];

    // Apply all filters
    const filteredRecords = payments.filter((record) => {
        const matchesSearch =
            record.billTo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = activeFilter === "All" || record.status === activeFilter;

        const cutoff = getDateCutoff();
        const matchesDate = !cutoff || new Date(record.createdAt || record.date) >= cutoff;

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination computed from filtered results
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
            {/* Filter section */}
            <div className="rounded-[8px] border-[#E5E7EB] border-2 p-4 my-6">
                <p className="text-[18px] font-semibold mb-4">Filters</p>
                <div className="flex flex-row gap-4">
                    {/* Date Range */}
                    <div className="flex flex-col gap-1 w-1/2">
                        <label htmlFor="Date-Range" className="text-sm font-medium text-[#374151]">Date Range</label>
                        <div className="relative">
                            <select
                                id="Date-Range"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full h-[48px] bg-inputBgColor rounded-md px-3 outline-none appearance-none cursor-pointer text-sm"
                            >
                                <option value="">All Time</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="60">Last 60 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1 w-1/2">
                        <label htmlFor="Status-Dropdown" className="text-sm font-medium text-[#374151]">Status</label>
                        <div className="relative">
                            <select
                                id="Status-Dropdown"
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                                className="w-full h-[48px] bg-inputBgColor rounded-md px-3 outline-none appearance-none cursor-pointer text-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="canceled">Canceled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <Table heading={heading} >
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading invoices...</td></tr>
                ) : filteredRecords.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No invoices found.</td></tr>
                ) : (
                    paginatedRecords.map((data: any, idx: number) => (
                        <tr
                            key={data?.id ?? idx}
                            className="border-b border-b-solid border-b-lightGreyColor"
                        >
                            {/* Invoice No */}
                            <td className="px-4 py-3 align-middle">
                                <div className="flex items-center gap-x-4">
                                    <span className="uppercase  font-medium">{data.invoiceNo}</span>
                                </div>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                {data.date}
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                {data.amount}
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                >
                                    <GoDotFill
                                        className="text-base"
                                    />
                                    {data.status}
                                </span>
                            </td>


                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <div className="flex items-center justify-start gap-x-3">
                                    <ViewIcon
                                        onClick={() => {
                                            setSelectedInvoiceId(data.id);
                                            setShowInvoiceModal(true);
                                        }}
                                    />
                                    <DownloadIcon
                                        onClick={async () => {
                                            await downloadInvoicePdf({
                                                invoiceNo: data.invoiceNo || `INV-${data.id?.split('-')[0]?.toUpperCase()}`,
                                                date: data.date || "-",
                                                dueDate: data.dueDate || data.date || "-",
                                                billTo: data.billTo || { name: "-", email: "-", address: "-", city: "-" },
                                                items: data.items || [{
                                                    description: `${data.plan || 'Standard'} Plan`,
                                                    subtext: 'Subscription',
                                                    qty: '01',
                                                    price: data.amount || '$0.00',
                                                    amount: data.amount || '$0.00',
                                                    status: data.status === 'paid' ? 'Paid' : (data.status === 'canceled' ? 'Canceled' : (data.status === 'overdue' ? 'Overdue' : 'Pending')),
                                                }],
                                                subtotal: data.subtotal || data.amount || '$0.00',
                                                tax: data.tax || '$0.00',
                                                total: data.total || data.amount || '$0.00',
                                                notes: data.notes || 'Thank you for your business!',
                                            });
                                        }}
                                    />
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