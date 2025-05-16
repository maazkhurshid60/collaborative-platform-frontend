import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import DownloadIcon from "../../../components/icons/download/Download"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"
import { isModalShowReducser } from "../../../redux/slices/ModalSlice"
import { toast } from "react-toastify"
import documentApiService from "../../../apiServices/documentApi/DocumentApi"
import { useQuery } from "@tanstack/react-query"

import * as mammoth from "mammoth";
import { DocModalData, documentSignByClientType, DocumentType } from "../../../types/documentType/DocumentType"


const Document = () => {
    const heading = ["document", "status", "date", "Shared by", "action"]
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const dispatch = useDispatch<AppDispatch>()
    const clientId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)


    const { data: documentData } = useQuery<DocumentType[]>({
        queryKey: ["documents"],
        queryFn: async () => {
            try {
                const response = await documentApiService.getAllSharedDocumentWithClientApi(clientId);

                console.log("response?.data?.data", response);

                return response?.data?.data; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: documentData || [], recordPerPage: 7 })

    console.log("documentData", documentData);

    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
            // const fullUrl = `http://localhost:8000/uploads/docs${fileUrl.replace("/uploads", "")}`;
            const fullUrl = `https://collaborative-platform-backend.onrender.com/uploads/docs${fileUrl.replace("/uploads", "")}`;

            const response = await fetch(fullUrl);
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
    const [dataSendToViewDocModal, setDataSendToViewDocModal] = useState<DocModalData>({ clientId: "", providerId: "", documentId: "", sharedDocumentId: "", eSignature: "", isAgree: false })
    return (
        <OutletLayout heading="Documents">
            {showModal && (
                <ViewDocModal
                    sharedDocs={selectedDoc}
                    data={dataSendToViewDocModal as documentSignByClientType}
                />
            )}


            <div className='mt-10 w-[100%]'>
                <Table heading={heading} >
                    {getCurrentRecords()?.map((data: DocumentType, id: number) => (

                        <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4`}>
                            <td className="px-2 py-2 font-semibold">{data?.document?.name}</td>
                            {/* <td className="px-2 py-2">{data.doctype}</td> */}
                            <td className="px-2 py-2 ">
                                <p className={`p-1.5 w-auto  rounded-md text-sm 
                                    ${data.isAgree ? "bg-primaryColorDark/20" : "bg-inputBgColor"}  flex items-center gap-x-3`}>
                                    <span><GoDotFill className={`${data.isAgree ? "text-primaryColorDark" : "text-textColor"}`} /></span>
                                    {data.isAgree ? "Completed" : "Pending"}
                                </p>
                            </td>
                            <td className="px-2 py-2">{data.createdAt}</td>
                            <td className="px-2 py-2 m-auto">
                                <div className="flex items-start gap-x-4">

                                    <UserIcon />
                                    <div className="text-left">
                                        <p>{data.provider.user.fullName}</p>
                                        <p className="lowercase"> {data.provider.email}</p>
                                    </div>
                                </div>
                            </td>



                            <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                <ViewIcon onClick={
                                    async () => {
                                        if (data?.isAgree) {
                                            toast.success("You have already signed this document");
                                            return;
                                        }
                                        try {
                                            // const fileUrl = `http://localhost:8000/uploads/docs${data?.document?.url?.replace("/uploads", "")}`;
                                            const fileUrl = `https://collaborative-platform-backend.onrender.com/uploads/docs${data?.document?.url?.replace("/uploads", "")}`;
                                            const response = await fetch(fileUrl);
                                            if (!response.ok) throw new Error("File not found");

                                            const arrayBuffer = await response.arrayBuffer();

                                            const result = await mammoth.convertToHtml({ arrayBuffer });
                                            const htmlContent = result.value; // this is safe HTML

                                            setSelectedDoc(htmlContent);
                                            setDataSendToViewDocModal({ clientId: data?.clientId, providerId: data?.providerId, documentId: data?.id })
                                            dispatch(isModalShowReducser(true));
                                        } catch (err) {
                                            toast.error("Unable to preview document.");
                                            console.error(err);
                                        }
                                    }} />
                                <DownloadIcon onClick={() => handleDownload(data?.document?.url ?? "", data?.document?.name ?? "")} />

                            </td>
                        </tr>
                    ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
            </div>


        </OutletLayout>
    )
}

export default Document