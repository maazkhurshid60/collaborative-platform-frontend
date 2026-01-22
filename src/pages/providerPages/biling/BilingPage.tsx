
import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import Table from "../../../components/table/Table"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go"
import ViewIcon from "../../../components/icons/view/View"
import DeleteIcon from "../../../components/icons/delete/DeleteIcon"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCountryNameFromCode } from "../../../utils/GetCountryName"
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice"
import { useDispatch } from "react-redux"
import { ChevronDown } from "lucide-react"
import DownloadIcon from "../../../components/icons/download/Download"
import InvoiceModal from "../../../components/modals/InvoiceModal"


const BilingHistory = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedUserForDelete, setSelectedUserForDelete] = useState("");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    const totalPages = 5;

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

    const mockData = [
        {
            id: "1",
            invoiceNo: "INV-2024-001",
            fullName: "John Doe",
            client: { email: "john.doe@example.com" },
            licenseNo: "LIC-12345",
            plan: "TXN-2024-001",
            status: "paid",
            amount: "$100",
            createdAt: "2024-01-15T10:00:00"
        },
        {
            id: "2",
            invoiceNo: "INV-2024-002",
            profileImage: null,
            fullName: "Jane Smith",
            status: "pending",
            plan: "TXN-2024-001",
            amount: "$100",
            createdAt: "2024-01-16T11:30:00"
        },
        {
            id: "3",
            invoiceNo: "INV-2024-003",
            fullName: "Alice Johnson",
            amount: "$300",
            client: { email: "alice.j@example.com" },
            status: "overdue",
            plan: "TXN-2024-001",
            createdAt: "2024-01-14T09:15:00"
        },
        {
            id: "4",
            invoiceNo: "INV-2024-004",
            plan: "TXN-2024-001",
            fullName: "Bob Brown",
            amount: "$400",
            client: { email: "bob.b@example.com" },
            status: "canceled",
            createdAt: "2024-01-18T14:20:00"
        }
    ];

    const filterOptions = ["All", "paid", "pending", "overdue", "canceled"];

    const filteredRecords = mockData.filter((record) => {
        const matchesSearch = record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.client?.email || (record as any).provider?.email)?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return (
        <OutletLayout heading="Invoice History">
            <p className="text-[20px] font-medium text-[#666666] mt-[-35px]" > View and manage all your invoices in one place</p>
            <div className="flex flex-row md:flex-row items-center  rounded-[8px] border-[#E5E7EB] border-2 h-[169px] gap-4 my-6 pl-2">
                <div className="w-1/2 flex flex-col items-start justify-evenly p-2">
                    <p className="text-[20px] font-medium ">Filters</p>
                    <label htmlFor="Date-Range">Date Range*</label>
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
                    <label htmlFor="Status-Dropdown">Status <span className="text-red-600">*</span></label>
                    <div className="relative w-full mt-2">
                        <select
                            id="Status-Dropdown"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="w-full h-[60px] bg-[#F0F2F3] rounded-md px-3 outline-none appearance-none cursor-pointer"
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
                {filteredRecords?.map((data: any, idx: number) => (
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
                            {data.createdAt.slice(0, 10)}
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
                                <DownloadIcon
                                    onClick={() => {
                                        setSelectedUserForDelete(data?.id ?? "");
                                        dispatch(isModalDeleteReducer(true));
                                    }}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
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
            />
        </OutletLayout>
    )
}

export default BilingHistory