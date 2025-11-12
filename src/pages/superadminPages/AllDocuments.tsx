import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

import * as mammoth from "mammoth";
import { AppDispatch, RootState } from "../../redux/store";
import documentApiService from "../../apiServices/documentApi/DocumentApi";
import usePaginationHook from "../../hook/usePaginationHook";
import { DocModalData, documentSignByClientType } from "../../types/documentType/DocumentType";
import OutletLayout from "../../layouts/outletLayout/OutletLayout";
import Loader from "../../components/loader/Loader";
import ViewDocModal from "../../components/modals/clientModal/viewDocModal/ViewDocModal";
import NoRecordFound from "../../components/noRecordFound/NoRecordFound";
import Table from "../../components/table/Table";
import ViewIcon from "../../components/icons/view/View";
import CustomPagination from "../../components/customPagination/CustomPagination";
import { isAddDocumentModalReducer, isModalDeleteReducer, isModalShowReducser } from "../../redux/slices/ModalSlice";
import DeleteIcon from "../../components/icons/delete/DeleteIcon";
import Button from "../../components/button/Button";
import { IoMdAdd } from "react-icons/io";
import ViewAddDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/ViewAddDocumentModal";
import DeleteDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/deleteDocumentModal/DeleteDocumentModal";
import SearchBar from "../../components/searchBar/SearchBar";
import { filterDocuments } from "../../utils/FilteredDocuments";

const AllDocuments = () => {
    const heading = ["document", "type", "date", "action"];
    const dispatch = useDispatch<AppDispatch>();

    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow);
    const deleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const showAddDocumentModal = useSelector((state: RootState) => state.modalSlice.isAddDocumentModalShow);
    const clientId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDocLoading, setIsDocLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState("");
    const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(null);
    const [dataSendToViewDocModal, setDataSendToViewDocModal] = useState<DocModalData>({
        clientId: "",
        providerId: "",
        documentId: "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
        recipientId: ""
    });

    const { data: documentData } = useQuery({
        queryKey: ["documents"],
        queryFn: async () => {
            try {
                setIsDocLoading(true);
                const response = await documentApiService.getAllDocuments(clientId);
                return response?.data?.data?.allDocuments || [];
            } catch (error) {
                console.error("Error fetching client:", error);
                return [];
            } finally {
                setIsDocLoading(false);
            }
        }
    });

    const filteredDocuments = filterDocuments(documentData || [], searchTerm);


    const { totalPages, getCurrentRecords, handlePageChange, currentPage } = usePaginationHook({
        data: Array.isArray(filteredDocuments) ? filteredDocuments : [],
        recordPerPage: 7
    });

    return (
        <OutletLayout
            heading="Documents"
            button={
                <Button
                    text="Add New"
                    onclick={() => dispatch(isAddDocumentModalReducer(true))}
                    icon={<IoMdAdd />}
                />
            }
        >
            {isDocLoading && <Loader text="Loading Documents..." />}

            {showAddDocumentModal && (
                <ViewAddDocumentModal
                    sharedDocs={selectedDoc}
                    isOnlyRead
                    data={dataSendToViewDocModal as documentSignByClientType}
                />
            )}

            {deleteModal && documentIdToDelete && (
                <DeleteDocumentModal
                    documentId={documentIdToDelete}

                />
            )}

            {showModal && (
                <ViewDocModal
                    sharedDocs={selectedDoc}
                    isOnlyRead
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

            <div className="mt-10 w-full">
                {getCurrentRecords()?.length === 0 ? (
                    <NoRecordFound />
                ) : (
                    <>
                        <Table heading={heading}>
                            {getCurrentRecords()?.map((data, id) => (
                                <tr key={id} className="border-b border-b-solid border-b-lightGreyColor pb-4">
                                    <td className="px-2 py-4 font-semibold">{data?.name}</td>
                                    <td className="px-2 py-4">{data?.type || "Questionaire"}</td>
                                    <td className="px-2 py-4">{data?.createdAt?.split("T")[0]}</td>

                                    <td className="py-2 align-middle">
                                        <div className="flex items-center gap-x-2">
                                            <ViewIcon
                                                onClick={async () => {
                                                    try {
                                                        const fileUrl = data?.url?.startsWith("http") && data?.url;
                                                        if (fileUrl) {
                                                            const response = await fetch(fileUrl);
                                                            if (!response.ok) throw new Error("File not found");

                                                            const arrayBuffer = await response.arrayBuffer();
                                                            const result = await mammoth.convertToHtml({ arrayBuffer });

                                                            setSelectedDoc(result.value);
                                                            setDataSendToViewDocModal({
                                                                clientId: data?.clientId,
                                                                providerId: data?.providerId,
                                                                documentId: data?.id,
                                                                recipientId: data?.provider?.userId
                                                            });

                                                            dispatch(isModalShowReducser(true));
                                                        }
                                                    } catch (err) {
                                                        toast.error("Unable to preview document.");
                                                        console.error(err);
                                                    }
                                                }}
                                            />
                                            <DeleteIcon
                                                onClick={() => {
                                                    setDocumentIdToDelete(data?.id);
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
                            onPageChange={handlePageChange}
                            hookCurrentPage={currentPage}
                        />
                    </>
                )}
            </div>
        </OutletLayout>
    );
};

export default AllDocuments;
