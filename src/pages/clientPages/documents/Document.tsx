import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import DownloadIcon from "../../../components/icons/download/Download"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"
import { isModalShowReducser, isshowSignedDocumentModalClientPortalReducer } from "../../../redux/slices/ModalSlice"
import { toast } from "react-toastify"
import documentApiService from "../../../apiServices/documentApi/DocumentApi"
import { useQuery } from "@tanstack/react-query"

import * as mammoth from "mammoth";
import { DocModalData, documentSignByClientType, DocumentType } from "../../../types/documentType/DocumentType"
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound"
import Loader from "../../../components/loader/Loader"
import SearchBar from "../../../components/searchBar/SearchBar"
import { filterDocuments } from "../../../utils/FilteredDocuments"
import SignedDocModal from "../../../components/modals/clientModal/viewDocModal/SignedDocModal"


const Document = () => {
    const heading = ["document", "type", "status", "date", "Shared by", "action"]
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const isshowSignedDocumentModal = useSelector((state: RootState) => state.modalSlice.isshowSignedDocumentModal)
    const dispatch = useDispatch<AppDispatch>()
    const clientId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)
    const [isDocLoading, setIsDocLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    const { data: documentData } = useQuery<DocumentType[]>({
        queryKey: ["documents"],
        queryFn: async () => {
            try {
                setIsDocLoading(true);

                const response = await documentApiService.getAllSharedDocumentWithClientApi(clientId);

                return response?.data?.data; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            } finally {
                setIsDocLoading(false); // Stop loader
            }
        }

    })
    const filteredDocuments = filterDocuments(documentData || [], searchTerm);

    const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
        usePaginationHook({ data: Array.isArray(filteredDocuments) ? filteredDocuments : [], recordPerPage: 7 });



    const handleDownload = async (fileUrl: string, fileName: string) => {


        try {


            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("File not found");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Download failed: File not found or server error.");
            console.error(err);
        }
    };

    const [selectedDoc, setSelectedDoc] = useState("")
    const [dataSendToSignedDocModal, setDataSendToSignedDocModal] = useState<DocumentType | undefined>(undefined)
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
    const callFun = async (value: DocumentType) => {
        if (value.isAgree) {

            console.log("getCurrentRecords()?.find(data => data?.id === data?.id)", value.id);
            setDataSendToSignedDocModal(getCurrentRecords()?.find(data => data?.id === value?.id))
            dispatch(isshowSignedDocumentModalClientPortalReducer(true));
            return;
        }
        else {
            try {
                const fileUrl = value?.document?.url && value?.document?.url.startsWith("http") && value?.document?.url;

                if (fileUrl) {
                    const response = await fetch(fileUrl);
                    if (!response.ok) throw new Error("File not found");

                    const arrayBuffer = await response.arrayBuffer();

                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    const htmlContent = result.value; // this is safe HTML

                    setSelectedDoc(htmlContent);
                    setDataSendToViewDocModal({ clientId: value?.clientId, providerId: value?.providerId, documentId: value?.id, recipientId: value?.provider?.userId })
                    dispatch(isModalShowReducser(true));
                }
            } catch (err) {
                toast.error("Unable to preview document.");
                console.error(err);
            }
        }

    }

    console.log(getCurrentRecords());

    return (
        <OutletLayout heading="Documents">
            {isDocLoading && <Loader text="Loading Document..." />}

            {isshowSignedDocumentModal && (
                <SignedDocModal
                    completedDoc={dataSendToSignedDocModal}
                    showDownloadButton
                />
            )}

            {showModal && (
                <ViewDocModal
                    sharedDocs={selectedDoc}
                    data={dataSendToViewDocModal as documentSignByClientType}
                />
            )}
            <div className="flex items-center justify-end mt-4">

                <div className="w-[40%] ">

                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, type, date, etc..."
                    />                </div>
            </div>

            <div className='mt-10 w-[100%]'>
                {getCurrentRecords()?.length === 0 ? <NoRecordFound />
                    : <>

                        <Table heading={heading} >
                            {getCurrentRecords()?.map((data: DocumentType, id: number) => (

                                <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4`}>
                                    <td className="px-2 py-2 font-semibold">{data?.document?.name}</td>
                                    <td className="px-2 py-2">{data?.document?.type ? data?.document?.type : "Questionaire"}</td>
                                    <td className="px-2 py-2 ">
                                        <p
                                            className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm 
    ${data.isAgree ? "bg-primaryColorDark/20" : "bg-inputBgColor"}`}
                                        >
                                            <span>
                                                <GoDotFill
                                                    className={`text-base ${data.isAgree ? "text-primaryColorDark" : "text-textColor"}`}
                                                />
                                            </span>
                                            {data.isAgree ? "Completed" : "Pending"}
                                        </p>

                                    </td>
                                    <td className="px-2 py-2">{data.createdAt.split("T")[0]}</td>
                                    <td className="px-2 py-2 m-auto">
                                        <div className="flex items-start gap-x-4">

                                            {/* <UserIcon /> */}
                                            {(data?.provider?.user?.profileImage !== null && data?.provider?.user?.profileImage !== "null") ?
                                                <img className='w-10 h-10 rounded-full object-cover' src={data?.provider?.user?.profileImage ? data?.provider?.user?.profileImage : undefined} />
                                                : <UserIcon size={30} />}
                                            <div className="text-left">
                                                <p>{data?.provider?.user?.fullName}</p>
                                                <p className="lowercase"> {data?.provider?.email}</p>
                                            </div>
                                        </div>
                                    </td>



                                    <td className="py-2 h-full align-middle">
                                        <div className="flex items-center justify-center gap-x-2 h-full">
                                            <ViewIcon onClick={() => callFun(data)}
                                            // async () => {
                                            //     const isAgree = data?.isAgree === true;
                                            // if (!isAgree) {

                                            //     console.log("getCurrentRecords()?.find(data => data?.id === data?.id)", data);
                                            //     setDataSendToSignedDocModal(getCurrentRecords()?.find(data => data?.id === data?.id))
                                            //     dispatch(isshowSignedDocumentModalClientPortalReducer(true));
                                            //     return toast.warn(".");
                                            // } else {

                                            //         toast.warn("..")
                                            // try {
                                            //     const fileUrl = data?.document?.url && data?.document?.url.startsWith("http") && data?.document?.url;

                                            //     if (fileUrl) {
                                            //         const response = await fetch(fileUrl);
                                            //         if (!response.ok) throw new Error("File not found");

                                            //         const arrayBuffer = await response.arrayBuffer();

                                            //         const result = await mammoth.convertToHtml({ arrayBuffer });
                                            //         const htmlContent = result.value; // this is safe HTML

                                            //         setSelectedDoc(htmlContent);
                                            //         setDataSendToViewDocModal({ clientId: data?.clientId, providerId: data?.providerId, documentId: data?.id, recipientId: data?.provider?.userId })
                                            //         dispatch(isModalShowReducser(true));
                                            //     }
                                            // } catch (err) {
                                            //     toast.error("Unable to preview document.");
                                            //     console.error(err);
                                            // }
                                            //     }


                                            // }}

                                            />
                                            {!data?.isAgree &&
                                                <DownloadIcon onClick={() => handleDownload(data?.document?.url ?? "", data?.document?.name ?? "")} />
                                            }
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


export default Document