import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"

import { useQuery } from "@tanstack/react-query"
import { DocModalData, documentSignByClientType, } from "../../../types/documentType/DocumentType"
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound"
import Loader from "../../../components/loader/Loader"
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi"
import { User } from "../../../types/providerType/ProviderType"
import DeleteIcon from "../../../components/icons/delete/DeleteIcon"
import { useNavigate } from "react-router-dom"
import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal"
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice"
import { getCountryNameFromCode } from "../../../utils/GetCountryName"
import SearchBar from "../../../components/searchBar/SearchBar"
import { filterUsers } from "../../../utils/FilteredUsers"


const VerifiedUsers = () => {
    const heading = ["Name", "License Number", "Country", "State", "status", "Role", "date", "action"]
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const [isDocLoading, setIsDocLoading] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<string>("");
    const isDeleteAccountShowModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: allUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                setIsDocLoading(true);

                const response = await loginUserApiService.getAllUsersApi();
                const allUsers = response.user?.filter((data: User) => data?.role !== "superadmin" && data?.isApprove === "approve")
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



    const [selectedDoc, setSelectedDoc] = useState("")
    const [dataSendToViewDocModal, setDataSendToViewDocModal] = useState<DocModalData>({ clientId: "", providerId: "", documentId: "", sharedDocumentId: "", eSignature: "", isAgree: false, recipientId: "" })

    useEffect(() => {
        if (!showModal) {
            setSelectedDoc("");
            setDataSendToViewDocModal({
                clientId: "",
                providerId: "",
                documentId: "",
                sharedDocumentId: "",
                eSignature: "",
                isAgree: false,
                recipientId: "",
            });
        }
    }, [showModal]);




    return (
        <OutletLayout heading="All Verified Users">
            {isDocLoading && <Loader text="Loading Verified Users..." />}
            {isDeleteAccountShowModal && selectedUserForDelete && (
                <DeleteAccountModal userId={selectedUserForDelete} />
            )}

            {showModal && (
                <ViewDocModal
                    sharedDocs={selectedDoc}
                    data={dataSendToViewDocModal as documentSignByClientType}
                />
            )}
            <div className="flex items-center justify-end">

                <div className="w-[40%] ">

                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, state, role, etc..."
                    />
                </div>
            </div>

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
                                                <p>{data?.fullName}</p>
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
    ${data.isApprove ? "bg-primaryColorDark/20" : "bg-inputBgColor"}`}
                                        >
                                            <span>
                                                <GoDotFill
                                                    className={`text-base ${data.isApprove && "text-textColor"}`}
                                                />
                                            </span>
                                            {data.isApprove === "approve" && "Verified"}
                                        </p>

                                    </td>
                                    <td className="px-2 py-2">{data?.role}</td>

                                    <td className="px-2 py-2">{data?.createdAt?.split("T")[0]}</td>




                                    <td className="py-2 h-full align-middle">
                                        <div className="flex items-center justify-start gap-x-2 h-full">
                                            <ViewIcon onClick={() => navigate(`/verified-users/view-user/${data?.id}`)} />
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


export default VerifiedUsers