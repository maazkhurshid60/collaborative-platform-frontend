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
    const heading = ["#", "Name", "License No/Client ID",
        //  "Country",

        "State", "status", "Role", "date", "action"]
    const showRestoreModal = useSelector((state: RootState) => state.modalSlice.isShowRestoreModal)
    const [isDocLoading, setIsDocLoading] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<{ id: string, role: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);

    const isDeleteAccountShowModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [selectedUserForRestore, setSelectedUserForRestore] = useState<User | null>(null);
    const queryClient = useQueryClient()
    const { data: allUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                setIsDocLoading(true);

                const response = await loginUserApiService.getAllUsersApi();
                const allUsers = response.user?.filter((data: User) => data?.role !== "superAdmin" && data?.isApprove === "REJECTED")
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
            setIsRestoreLoading(true);
            await loginUserApiService.restoreUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.email,
            });
            toast.success("User restored successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowRestoreReducer(false));
            setSelectedUserForRestore(null);
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to restore user");
        } finally {
            setIsRestoreLoading(false);
        }
    };



    return (
        <OutletLayout heading="All Rejected Users">
            {isDocLoading && <Loader text="Loading Rejected Users..." />}
            {isDeleteAccountShowModal && selectedUserForDelete && (
                <DeleteAccountModal userId={selectedUserForDelete.id} role={selectedUserForDelete.role} />
            )}


            {showRestoreModal && selectedUserForRestore && (
                <RestoreAccountModal
                    onConfirm={async () => await restoreFunction(selectedUserForRestore)}
                    onCancel={() => {
                        setSelectedUserForRestore(null);
                        dispatch(isModalShowRestoreReducer(false));
                    }}
                    isLoading={isRestoreLoading}
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
                    : <>

                        <Table heading={heading} >
                            {getCurrentRecords()?.map((data: User, id: number) => (

                                <tr key={id} className={`border-b border-b-solid border-b-lightGreyColor pb-4`}>
                                    <td className="px-4 py-3">{(currentPage - 1) * 7 + (id + 1)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-x-4">
                                            <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                                {data?.profileImage !== null && data?.profileImage !== "null" ? (
                                                    <img className="w-10 h-10 object-cover" src={data?.profileImage ? data?.profileImage : undefined} alt="User" />
                                                ) : (
                                                    <UserIcon size={30} />
                                                )}
                                            </div>
                                            <div className="text-left flex flex-col gap-y-0.5">
                                                <p className="capitalize leading-5">{data?.fullName}</p>
                                                <p className="text-gray-500">{data?.email?.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {data.role === "client" ? data?.client?.clientId : data?.licenseNo}
                                    </td>
                                    {/* <td className="px-4 py-3">{getCountryNameFromCode(data.country)}</td> */}
                                    <td className="px-4 py-3">{data.state}</td>
                                    <td className="px-4 py-3">
                                        <p
                                            className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm 
    ${data.isApprove ? "bg-redColor/20" : "bg-inputBgColor"}`}
                                        >
                                            <GoDotFill
                                                className={`text-base ${data.isApprove === "REJECTED" && "text-textColor"}`}
                                            />
                                            {data.isApprove === "REJECTED" && "Rejected"}
                                        </p>

                                    </td>
                                    <td className="px-4 py-3 capitalize">{data?.role}</td>

                                    <td className="px-4 py-3">{data?.createdAt?.split("T")[0]}</td>




                                    <td className="px-4 py-3 h-full align-middle">
                                        <div className="flex items-center justify-start gap-x-2 h-full">
                                            <RestoreIcon onClick={() => {
                                                setSelectedUserForRestore(data);

                                                dispatch(isModalShowRestoreReducer(true))
                                            }} />
                                            <ViewIcon onClick={() => navigate(`/rejected-users/view-user/${data?.id}`)} />
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
                    </>}

            </div>


        </OutletLayout>
    )
}


export default RejectedUsers