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
    const heading = ["#", "Name", "License/Client ID",
        //  "Country",
        "State", "status", "Role", "date", "action"];
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow);
    const showRejectModal = useSelector((state: RootState) => state.modalSlice.isShowRejectModal);
    const isDeleteAccountShowModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [selectedUserForApproval, setSelectedUserForApproval] = useState<User | null>(null);
    const [selectedUserForReject, setSelectedUserForReject] = useState<User | null>(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<{ id: string, role: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isApproveLoading, setIsApproveLoading] = useState(false);
    const [isRejectLoading, setIsRejectLoading] = useState(false);

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
                return response.user?.filter((data: User) => data?.role !== "superAdmin" && data?.isApprove === "PENDING") || [];
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
            setIsApproveLoading(true);
            await loginUserApiService.approveUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.email,
            });
            toast.success("User approved successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowReducser(false));
            setSelectedUserForApproval(null);
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to approve user");
        } finally {
            setIsApproveLoading(false);
        }
    };
    const rejectFunction = async (data: User) => {
        try {
            setIsRejectLoading(true);
            await loginUserApiService.rejectUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.email,
            });
            toast.success("User rejected successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowRejectReducer(false));
            setSelectedUserForReject(null);
        } catch (error) {
            console.error("Rejected failed:", error);
            toast.error("Failed to rejected user");
        } finally {
            setIsRejectLoading(false);
        }
    };
    console.log("PENDING USERS", getCurrentRecords());

    return (
        <OutletLayout heading="All Pending Users">
            {isAllUsersLoading && <Loader text="Loading users..." />}

            {isDeleteAccountShowModal && selectedUserForDelete && (
                <DeleteAccountModal userId={selectedUserForDelete.id} role={selectedUserForDelete.role} />
            )}

            {showModal && selectedUserForApproval && (
                <VerifyAccountModal
                    onConfirm={async () => await approveFunction(selectedUserForApproval)}
                    onCancel={() => {
                        setSelectedUserForApproval(null);
                        dispatch(isModalShowReducser(false));
                    }}
                    isLoading={isApproveLoading}
                />
            )}
            {showRejectModal && selectedUserForReject && (
                <RejectAccountModal
                    onConfirm={async () => await rejectFunction(selectedUserForReject)}
                    onCancel={() => {
                        setSelectedUserForReject(null);
                        dispatch(isModalShowRejectReducer(false));
                    }}
                    isLoading={isRejectLoading}
                />
            )}
            {/* {getCurrentRecords()?.length !== 0 && */}
            <div className="flex items-center justify-end">

                <div className="w-[40%] ">

                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Name, Email, State, Role, etc..."
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
                                        <td className="px-4 py-3">{(currentPage - 1) * 7 + (id + 1)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-x-4 items-center">
                                                <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                                    {data?.profileImage && data.profileImage !== "null" ? (
                                                        <img className="w-10 h-10 object-cover" src={data.profileImage} alt="User" />
                                                    ) : (
                                                        <UserIcon size={30} />
                                                    )}
                                                </div>
                                                <div className="text-left flex flex-col gap-y-0.5 items-start justify-center">
                                                    <p className="capitalize leading-5">{data.fullName}</p>
                                                    <p className="text-gray-500">{data?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{data.role === 'client' ? data.client?.clientId : data.licenseNo}</td>
                                        {/* <td className="px-4 py-3">{getCountryNameFromCode(data.country)}</td> */}
                                        <td className="px-4 py-3">{data.state}</td>
                                        <td className="px-4 py-3">
                                            <p className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${data.isApprove === "PENDING" ? "bg-primaryColorDark/20" : "bg-inputBgColor"}`}>
                                                <GoDotFill className={`text-base ${data.isApprove === "PENDING" && "text-textColor"}`} />
                                                {data.isApprove === "PENDING" && "Pending"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 capitalize">{data.role}</td>
                                        <td className="px-4 py-3">{data?.createdAt?.split("T")[0]}</td>
                                        <td className="px-4 py-3">
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
                                                    setSelectedUserForDelete({ id: data?.id ?? "", role: data?.role ?? "" });
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
