
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


const TransactionDetail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedUserForDelete, setSelectedUserForDelete] = useState("");

    const totalPages = 5;

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

    interface Transaction {
        id: string;
        fullName: string;
        client?: { email: string };
        provider?: { email: string };
        licenseNo?: string;
        plan: string;
        status: string;
        amount: string;
        createdAt: string;
        profileImage?: string | null;
    }

    const mockData: Transaction[] = [
        {
            id: "1",
            fullName: "John Doe",
            client: { email: "john.doe@example.com" },
            licenseNo: "LIC-12345",
            plan: "TXN-2024-001",
            status: "Success",
            amount: "$100",
            createdAt: "2024-01-15T10:00:00"
        },
        {
            id: "2",
            profileImage: null,
            fullName: "Jane Smith",
            status: "Pending",
            plan: "TXN-2024-001",
            amount: "$100",
            createdAt: "2024-01-16T11:30:00"
        },
        {
            id: "3",
            fullName: "Alice Johnson",
            amount: "$300",
            client: { email: "alice.j@example.com" },
            status: "Failed", plan: "TXN-2024-001",
            createdAt: "2024-01-14T09:15:00"
        },
        {
            id: "4",
            plan: "TXN-2024-001",
            fullName: "Bob Brown",
            amount: "$400",
            client: { email: "bob.b@example.com" },
            status: "Refunded",
            createdAt: "2024-01-18T14:20:00"
        }
    ];

    const filterOptions = ["All", "Success", "Pending", "Failed", "Refunded"];

    const filteredRecords = mockData.filter((record) => {
        const matchesSearch = record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.client?.email || record.provider?.email)?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = activeFilter === "All" || record.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Success": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Failed": return "bg-red-100 text-red-700";
            case "Refunded": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
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
                            placeholder="Search Transactions"
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
                                ? "bg-primaryColorDark text-white border-primaryColorDark" // Assuming primaryColorDark is available, or fallback to custom style
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            style={activeFilter === option ? { backgroundColor: '#0F766E', borderColor: '#0F766E' } : {}} // Inline style fallback to match teal/green from image if class fails
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <Table heading={heading}>
                {filteredRecords?.map((data: any, idx: number) => (
                    <tr
                        key={data?.id ?? idx}
                        className="border-b-[1px] border-b-solid border-b-lightGreyColor"
                    >
                        {/* Name */}
                        <td className="px-2 py-3 align-middle">
                            <div className="flex items-center gap-x-4">
                                {
                                    data.createdAt.slice(0, 10)
                                }

                            </div>
                        </td>

                        <td className="px-2 py-3 align-middle whitespace-nowrap">
                            <p className="capitalize leading-5 text-[15px] font-medium">{data?.fullName}</p>
                        </td>

                        <td className="px-2 py-3 align-middle whitespace-nowrap">
                            {getCountryNameFromCode(data.plan)}
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
                                    onClick={() =>
                                        navigate(
                                            `/transaction-details/${data?.id}`
                                        )
                                    }
                                />
                                <DeleteIcon
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
        </OutletLayout>
    )
}

export default TransactionDetail