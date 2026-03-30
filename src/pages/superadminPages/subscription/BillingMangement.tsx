import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import Table from "../../../components/table/Table"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import { GoDotFill } from "react-icons/go"
import { Download as DownloadIcon, User2, User2Icon, UserCircle2, UserIcon } from "lucide-react"
import ViewIcon from "../../../components/icons/view/View"
import DeleteIcon from "../../../components/icons/delete/DeleteIcon"
import DownloadIconComponent from "../../../components/icons/download/Download"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice"
import { useDispatch, useSelector } from "react-redux"
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi"
//import DeleteSubscriptionModal from "../../../components/modals/superAdminModal/deleteSubscriptionModal/DeleteSubscriptionModal"
import InvoiceModal from "../../../components/modals/InvoiceModal"
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf"
import { RootState } from "../../../redux/store"
import { toast } from "react-toastify"
import DeleteProviderModal from "../../../components/modals/DeleteProviderModal"


const SubscriptionPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isDeleteModalOpen = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedSubscriptionForDelete, setSelectedSubscriptionForDelete] = useState("");
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);

    const recordsPerPage = 10;

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await superAdminApi.getAllSubscriptions();
            setSubscriptions(response.data || []);
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const heading = [
        "Provider Name",
        "Plan",
        "Last PaymentDate",
        "Amount",
        "Status",
        "Action",
    ];

    const formatStatus = (status: string) => {
        if (!status) return "N/A";
        const lower = status.toLowerCase();
        if (lower === "succeeded" || lower === "active") return "Paid";
        if (lower === "trialing") return "Trial";
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatPlan = (plan: string) => {
        if (!plan) return "N/A";
        return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    };

    const handleViewInvoice = (record: any) => {
        const lastPayment = record.user?.payments?.[0];
        if (!lastPayment) {
            toast.info("No payment record found for this subscription");
            return;
        }

        const invoice = {
            invoiceNo: lastPayment.stripeInvoiceId || `INV-${lastPayment.id.slice(0, 8)}`,
            date: formatDate(lastPayment.periodStart || lastPayment.createdAt),
            dueDate: formatDate(lastPayment.periodEnd || lastPayment.createdAt),
            billTo: {
                name: record.user?.fullName || "-",
                email: record.user?.email || "-",
                address: record.user?.address || "-",
                city: `${record.user?.state || ""}, ${record.user?.country || ""}`
            },
            items: [
                {
                    description: formatPlan(record.plan),
                    subtext: "Platform Access",
                    qty: "01",
                    price: `$${lastPayment.amount / 100}`,
                    amount: `$${lastPayment.amount / 100}`,
                    status: formatStatus(lastPayment.status)
                }
            ],
            subtotal: `$${lastPayment.amount / 100}`,
            tax: "$0.00",
            total: `$${lastPayment.amount / 100}`,
            notes: "Thank you for being a part of our platform."
        };
        setSelectedInvoiceData(invoice);
        setShowInvoiceModal(true);
    };

    const handleDownloadInvoice = async (record: any) => {
        const lastPayment = record.user?.payments?.[0];
        if (!lastPayment) {
            toast.info("No payment record found for this subscription");
            return;
        }

        await downloadInvoicePdf({
            invoiceNo: lastPayment.stripeInvoiceId || `INV-${lastPayment.id.slice(0, 8)}`,
            date: formatDate(lastPayment.periodStart || lastPayment.createdAt),
            dueDate: formatDate(lastPayment.periodEnd || lastPayment.createdAt),
            billTo: {
                name: record.user?.fullName || "-",
                email: record.user?.email || "-",
                address: record.user?.address || "-",
                city: `${record.user?.state || ""}, ${record.user?.country || ""}`
            },
            items: [{
                description: formatPlan(record.plan),
                subtext: "Platform Access",
                qty: "01",
                price: `$${lastPayment.amount / 100}`,
                amount: `$${lastPayment.amount / 100}`,
                status: formatStatus(lastPayment.status)
            }],
            subtotal: `$${lastPayment.amount / 100}`,
            tax: "$0.00",
            total: `$${lastPayment.amount / 100}`,
            notes: "Thank you for being a part of our platform."
        });
    };

    const filterOptions = ["All", "Trial", "Paid", "Failed", "Canceled"];

    const filteredRecords = subscriptions.filter((record) => {
        const fullName = record.user?.fullName || "";
        const email = record.user?.email || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());

        const displayStatus = formatStatus(record.status);
        const matchesFilter = activeFilter === "All" || displayStatus === activeFilter;

        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage));

    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case "succeeded":
            case "active":
            case "paid": return "bg-green-100 text-green-700";
            case "trialing":
            case "trial": return "bg-blue-100 text-blue-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            case "refunded": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
    };

    const getPlanColor = (plan: string) => {
        const lowerPlan = plan.toLowerCase();
        switch (lowerPlan) {
            case "enterprise":
            case "pro": return "bg-purple-100 text-purple-700";
            case "professional": return "bg-blue-100 text-blue-700";
            case "basic":
            case "standard": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
    };

    return (
        <OutletLayout heading="Billing Management">
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
                            placeholder="Search Provider or Email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
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
                    <tr><td colSpan={6} className="text-center py-4">Loading billing data...</td></tr>
                ) : paginatedRecords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">No billing records found.</td></tr>
                ) : (
                    paginatedRecords.map((record: any, idx: number) => {
                        const lastPayment = record.user?.payments?.[0];
                        return (
                            <tr
                                key={record?.id ?? idx}
                                className="border-b border-b-solid border-b-lightGreyColor"
                            >
                                {/* Name */}
                                <td className="px-4 py-3 align-middle">
                                    {record.user?.profileImage ? (
                                        <div className="flex items-center gap-x-4">
                                            <img
                                                src={record.user?.profileImage}
                                                alt="profile"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <p className="capitalize font-medium">{record.user?.fullName}</p>
                                                <p className="text-xs text-gray-500 lowercase">{record.user?.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-x-4">
                                            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full object-cover">
                                                <UserIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="capitalize font-medium">{record.user?.fullName}</p>
                                                <p className="text-xs text-gray-500 lowercase">{record.user?.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 align-middle whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getPlanColor(record.plan)}`}
                                    >
                                        {formatPlan(record.plan)}
                                    </span>
                                </td>

                                <td className="px-4 py-3 align-middle whitespace-nowrap">
                                    <span>
                                        {lastPayment ? formatDate(lastPayment.createdAt) : "No payment"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-middle whitespace-nowrap">
                                    {lastPayment ? `$${lastPayment.amount / 100}` : "$0.00"}
                                </td>

                                <td className="px-4 py-3 align-middle whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(record.status)}`}
                                    >
                                        <GoDotFill className="text-base" />
                                        {formatStatus(record.status)}
                                    </span>
                                </td>

                                <td className="px-4 py-3 align-middle whitespace-nowrap">
                                    <div className="flex items-center justify-start gap-x-3">
                                        <ViewIcon onClick={() => navigate(`/billing-management/${record.user?.id}`)} />

                                        <DeleteIcon
                                            onClick={() => {
                                                setSelectedSubscriptionForDelete(record?.id ?? "");
                                                dispatch(isModalDeleteReducer(true));
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </Table>

            <CustomPagination
                totalPages={totalPages}
                onPageChange={onPageChange}
                hookCurrentPage={currentPage}
            />

            {isDeleteModalOpen && selectedSubscriptionForDelete && (
                <DeleteProviderModal
                    subscriptionId={selectedSubscriptionForDelete}
                    onSuccess={fetchSubscriptions}
                />
            )}

            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                invoiceId={null}
                invoiceData={selectedInvoiceData}
            />
        </OutletLayout>
    )
}

export default SubscriptionPage