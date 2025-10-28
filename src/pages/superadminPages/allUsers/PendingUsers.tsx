import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"
import { toast } from "react-toastify"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound"
import Loader from "../../../components/loader/Loader"
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi"
import { User } from "../../../types/providerType/ProviderType"
import DeleteIcon from "../../../components/icons/delete/DeleteIcon"
import ApproveIcon from "../../../components/icons/approve/Approve"
import VerifyAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/VerifyAccountModal"
import { isModalDeleteReducer, isModalShowReducser, isModalShowRejectReducer } from "../../../redux/slices/ModalSlice"
import { useNavigate } from "react-router-dom"
import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal"
import { getCountryNameFromCode } from "../../../utils/GetCountryName"
import RejectIcon from "../../../components/icons/reject/Reject"
import RejectAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RejectAccountModal"
import { filterUsers } from "../../../utils/FilteredUsers"
import SearchBar from "../../../components/searchBar/SearchBar"

const PendingUsers = () => {
    const heading = ["Name", "License Number", "Country", "State", "status", "Role", "date", "action"];
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow);
    const showRejectModal = useSelector((state: RootState) => state.modalSlice.isShowRejectModal);
    const isDeleteAccountShowModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [selectedUserForApproval, setSelectedUserForApproval] = useState<User | null>(null);
    const [selectedUserForReject, setSelectedUserForReject] = useState<User | null>(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAllUsersLoading, setIsAllUsersLoading] = useState(false);
    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { data: allUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                setIsAllUsersLoading(true);
                const response = await loginUserApiService.getAllUsersApi();
                return response.user?.filter((data: User) => data?.role !== "superadmin" && data?.isApprove === "pending") || [];
            } catch (error) {
                console.error("Error fetching users:", error);
                return [];
            } finally {
                setIsAllUsersLoading(false);
            }
        }
    });
    const filteredUsers = filterUsers(allUsers || [], searchTerm);

    const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
        usePaginationHook({ data: filteredUsers || [], recordPerPage: 7 });

    const approveFunction = async (data: User) => {
        try {
            await loginUserApiService.approveUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });
            toast.success("User approved successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowReducser(false));
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to approve user");
            dispatch(isModalShowReducser(false));
        }
    };
    const rejectFunction = async (data: User) => {
        try {
            await loginUserApiService.rejectUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });
            toast.success("User rejected successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowReducser(false));
        } catch (error) {
            console.error("Rejected failed:", error);
            toast.error("Failed to rejected user");
            dispatch(isModalShowReducser(false));
        }
    };
    console.log("PENDING USERS", getCurrentRecords());

    return (
        <OutletLayout heading="All Pending Users">
            {isAllUsersLoading && <Loader text="Loading users..." />}

            {isDeleteAccountShowModal && selectedUserForDelete && (
                <DeleteAccountModal userId={selectedUserForDelete} />
            )}

            {showModal && selectedUserForApproval && (
                <VerifyAccountModal
                    onConfirm={async () => await approveFunction(selectedUserForApproval)}
                    onCancel={() => {
                        setSelectedUserForApproval(null);
                        dispatch(isModalShowReducser(false));
                    }}
                />
            )}
            {showRejectModal && selectedUserForReject && (
                <RejectAccountModal
                    onConfirm={async () => await rejectFunction(selectedUserForReject)}
                    onCancel={() => {
                        setSelectedUserForReject(null);
                        dispatch(isModalShowRejectReducer(false));
                    }}
                />
            )}
            {/* {getCurrentRecords()?.length !== 0 && */}
            <div className="flex items-center justify-end">

                <div className="w-[40%] ">

                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, state, role, etc..."
                    />                </div>
            </div>
            {/* } */}
            <div className='mt-10 w-full'>
                {getCurrentRecords()?.length === 0 ? <NoRecordFound />
                    : (
                        <>
                            <Table heading={heading}>
                                {(getCurrentRecords() as User[])?.map((data, id) => (
                                    <tr key={id} className="border-b border-b-lightGreyColor">
                                        <td className="px-2 py-2">
                                            <div className="flex gap-x-4 items-start">
                                                {data?.profileImage && data.profileImage !== "null" ? (
                                                    <img className="w-10 h-10 rounded-full object-cover" src={data.profileImage} />
                                                ) : <UserIcon size={30} />}
                                                <div className="text-left">
                                                    <p>{data.fullName}</p>
                                                    <p>{data?.client?.email || data?.provider?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">{data.licenseNo}</td>
                                        <td className="px-2 py-2">{getCountryNameFromCode(data.country)}</td>
                                        <td className="px-2 py-2">{data.state}</td>
                                        <td className="px-2 py-2">
                                            <p className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${data.isApprove === "pending" ? "bg-primaryColorDark/20" : "bg-inputBgColor"}`}>
                                                <GoDotFill className={`text-base ${data.isApprove === "pending" && "text-textColor"}`} />
                                                {data.isApprove === "pending" && "Pending"}
                                            </p>
                                        </td>
                                        <td className="px-2 py-2">{data.role}</td>
                                        <td className="px-2 py-2">{data?.createdAt?.split("T")[0]}</td>
                                        <td className="py-2">
                                            <div className="flex items-center gap-x-2">
                                                <ApproveIcon onClick={() => {
                                                    setSelectedUserForApproval(data);
                                                    dispatch(isModalShowReducser(true));
                                                }} />
                                                <RejectIcon onClick={() => {
                                                    setSelectedUserForReject(data);
                                                    dispatch(isModalShowRejectReducer(true));
                                                }} />
                                                <ViewIcon onClick={() => navigate(`/pending-users/view-user/${data?.id}`)} />
                                                <DeleteIcon onClick={() => {
                                                    setSelectedUserForDelete(data?.id ?? "");
                                                    dispatch(isModalDeleteReducer(true));
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                            <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
                        </>
                    )}
            </div>
        </OutletLayout>
    )
}

export default PendingUsers;
