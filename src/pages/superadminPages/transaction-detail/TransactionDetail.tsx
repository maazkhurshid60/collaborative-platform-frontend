
import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import Table from "../../../components/table/Table"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import { GoDotFill } from "react-icons/go"
import ViewIcon from "../../../components/icons/view/View"
import { useState, useEffect, useMemo } from "react"
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi"
import InvoiceModal from "../../../components/modals/InvoiceModal"
import DownloadIcon from "../../../components/icons/download/Download"
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf"

const TransactionDetail = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);

    const recordsPerPage = 10;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await superAdminApi.getAllPayments();
                setPayments(response.data || []);
                console.log(response.data, "Payments Data for Transaction Detail");
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
        "Date",
        "Provider Name",
        "Plan",
        "Amount",
        "Status",
        "Action",
    ];

    const formatStatus = (status: string) => {
        if (!status) return "-";
        const lower = status.toLowerCase();
        if (lower === "succeeded") return "Paid";
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const filterOptions = ["All", "Paid", "Failed", "Canceled"];

    const filteredRecords = useMemo(() => payments.filter((record) => {
        const fullName = record.user?.fullName || "";
        const email = record.user?.email || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "All" || formatStatus(record.status) === activeFilter;
        return matchesSearch && matchesFilter;
    }), [payments, searchTerm, activeFilter]);

    // Reset to page 1 whenever search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const paginatedRecords = useMemo(() => filteredRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    ), [filteredRecords, currentPage]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage)),
        [filteredRecords]
    );

    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case "succeeded":
            case "paid": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            case "canceled": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
    };

    const prepareInvoiceData = (data: any) => {
        const displayStatus = formatStatus(data.status);
        return {
            invoiceNo: data.stripeInvoiceId || `INV-${data.id.slice(0, 8)}`,
            date: formatDate(data.periodStart || data.createdAt),
            dueDate: formatDate(data.periodEnd || data.createdAt),
            billTo: {
                name: data.user?.fullName || "-",
                email: data.user?.email || "-",
                address: data.user?.address || "-",
                city: `${data.user?.state || ""}, 
                
                // ${data.user?.country || ""}`
            },
            items: [
                {
                    description: data.plan || "Subscription Plan",
                    subtext: "Platform Access",
                    qty: "01",
                    price: `$${data.amount / 100}`,
                    amount: `$${data.amount / 100}`,
                    status: displayStatus
                }
            ],
            subtotal: `$${data.amount / 100}`,
            tax: "$0.00",
            total: `$${data.amount / 100}`,
            notes: "Thank you for being a part of our platform."
        };
    };

    const handleViewInvoice = (data: any) => {
        const invoice = prepareInvoiceData(data);
        setSelectedInvoiceData(invoice);
        setShowInvoiceModal(true);
    };

    const handleDownloadInvoice = async (data: any) => {
        const invoice = prepareInvoiceData(data);
        await downloadInvoicePdf(invoice);
    };

    return (
        <OutletLayout heading="Transaction Lists">
            <div className="flex flex-col md:flex-row items-center gap-4 my-6 pl-10.5">
                <div className="w-full md:w-[40%]">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primaryColorDark focus:border-primaryColorDark outline-none"
                            placeholder="Search Transactions by Name or Email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setActiveFilter(option)}
                            className={`px-4 py-2 cursor-pointer rounded-md text-sm transition-colors border ${activeFilter === option
                                ? "bg-primaryColorDark text-white border-primaryColorDark"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            style={activeFilter === option ? { backgroundColor: '#0F766E', borderColor: '#0F766E' } : {}}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <Table heading={heading}>
                {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading transactions...</td></tr>
                ) : paginatedRecords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">No transactions found.</td></tr>
                ) : (
                    paginatedRecords.map((data: any, idx: number) => (
                        <tr
                            key={data?.id ?? idx}
                            className="border-b border-b-solid border-b-lightGreyColor"
                        >
                            <td className="px-4 py-3 align-middle">
                                {formatDate(data.createdAt)}
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <div className="flex flex-col">
                                    <p className="capitalize leading-5 text-[15px] font-medium">{data?.user?.fullName}</p>
                                    <p className="text-xs text-gray-500 lowercase mt-0.5">{data?.user?.email}</p>
                                </div>
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                {data.plan || "-"}
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                ${data.amount / 100}
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                >
                                    <GoDotFill className="text-base" />
                                    {formatStatus(data.status)}
                                </span>
                            </td>

                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <div className="flex items-center justify-start gap-x-3">
                                    <button onClick={() => handleViewInvoice(data)} className="hover:scale-110 transition-transform">
                                        <ViewIcon />
                                    </button>
                                    <button onClick={() => handleDownloadInvoice(data)} className="hover:scale-110 transition-transform cursor-pointer">
                                        <DownloadIcon className="w-[18px] h-[18px] object-cover" />
                                    </button>
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
                invoiceId={null}
                invoiceData={selectedInvoiceData}
            />
        </OutletLayout>
    )
}

export default TransactionDetail
