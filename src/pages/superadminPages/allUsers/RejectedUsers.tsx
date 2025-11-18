import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go";
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound"
import Loader from "../../../components/loader/Loader"
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi"
import { User } from "../../../types/providerType/ProviderType"
import DeleteIcon from "../../../components/icons/delete/DeleteIcon"
import { useNavigate } from "react-router-dom"
import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal"
import { isModalDeleteReducer, isModalShowRestoreReducer } from "../../../redux/slices/ModalSlice"
import { getCountryNameFromCode } from "../../../utils/GetCountryName"
import RestoreIcon from "../../../components/icons/restore/RestoreIcon"
import { toast } from "react-toastify"
import RestoreAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RestoreAccountModal"
import SearchBar from "../../../components/searchBar/SearchBar"
import { filterUsers } from "../../../utils/FilteredUsers"


const RejectedUsers = () => {
    const heading = ["Name", "License Number", "Country", "State", "status", "Role", "date", "action"]
    const showRestoreModal = useSelector((state: RootState) => state.modalSlice.isShowRestoreModal)
    const [isDocLoading, setIsDocLoading] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const isDeleteAccountShowModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [selectedUserForRestore, setSelectedUserForRestore] = useState<User | null>(null);
    const queryClient = useQueryClient()
    const { data: allUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                setIsDocLoading(true);

                const response = await loginUserApiService.getAllUsersApi();
                const allUsers = response.user?.filter((data: User) => data?.role !== "superadmin" && data?.isApprove === "reject")
                return allUsers; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            } finally {
                setIsDocLoading(false); // Stop loader
            }
        }

    })
    const filteredUsers = filterUsers(allUsers || [], searchTerm);

    const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
        usePaginationHook({ data: Array.isArray(filteredUsers) ? filteredUsers : [], recordPerPage: 7 });


    const restoreFunction = async (data: User) => {
        try {
            await loginUserApiService.restoreUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });
            toast.success("User restored successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowRestoreReducer(false));
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to restore user");
            dispatch(isModalShowRestoreReducer(false));
        }
    };



    return (
        <OutletLayout heading="All Rejected Users">
            {isDocLoading && <Loader text="Loading Rejected Users..." />}
            {isDeleteAccountShowModal && selectedUserForDelete && (
                <DeleteAccountModal userId={selectedUserForDelete} />
            )}


            {showRestoreModal && selectedUserForRestore && (
                <RestoreAccountModal
                    onConfirm={async () => await restoreFunction(selectedUserForRestore)}
                    onCancel={() => {
                        setSelectedUserForRestore(null);
                        dispatch(isModalShowRestoreReducer(false));
                    }}
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
            <div className='mt-10 w-[100%]'>
                {getCurrentRecords()?.length === 0 ? <NoRecordFound />
                    : <>

                        <Table heading={heading} >
                            {getCurrentRecords()?.map((data: User, id: number) => (

                                <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4`}>
                                    <td className="px-2 py-2 m-auto">
                                        <div className="flex items-start gap-x-4">


                                            {(data?.profileImage !== null && data?.profileImage !== "null") ?
                                                <img className='w-10 h-10 rounded-full object-cover' src={data?.profileImage ? data?.profileImage : undefined} />
                                                : <UserIcon size={30} />}
                                            <div className="text-left">
                                                <p className="capitalize">{data?.fullName}</p>
                                                <p>{(data?.client?.email || data?.provider?.email)?.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 m-auto">
                                        {data?.licenseNo}
                                    </td>
                                    <td className="px-2 py-2">{getCountryNameFromCode(data.country)}</td>
                                    <td className="px-2 py-2">{data.state}</td>
                                    <td className="px-2 py-2 ">
                                        <p
                                            className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm 
    ${data.isApprove ? "bg-redColor/20" : "bg-inputBgColor"}`}
                                        >
                                            <span>
                                                <GoDotFill
                                                    className={`text-base ${data.isApprove === "reject" && "text-textColor"}`}
                                                />
                                            </span>
                                            {data.isApprove === "reject" && "Rejected"}
                                        </p>

                                    </td>
                                    <td className="px-2 py-2 capitalize">{data?.role}</td>

                                    <td className="px-2 py-2">{data?.createdAt?.split("T")[0]}</td>




                                    <td className="py-2 h-full align-middle">
                                        <div className="flex items-center justify-start gap-x-2 h-full">
                                            <RestoreIcon onClick={() => {
                                                setSelectedUserForRestore(data);

                                                dispatch(isModalShowRestoreReducer(true))
                                            }} />
                                            <ViewIcon onClick={() => navigate(`/rejected-users/view-user/${data?.id}`)} />
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
                    </>}

            </div>


        </OutletLayout>
    )
}


export default RejectedUsers