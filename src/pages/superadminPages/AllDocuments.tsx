import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../apiServices/axiosInstance/AxiosInstance";

import { AppDispatch, RootState } from "../../redux/store";
import documentApiService from "../../apiServices/documentApi/DocumentApi";
import usePaginationHook from "../../hook/usePaginationHook";
import {
  DocModalData,
  documentSignByClientType,
} from "../../types/documentType/DocumentType";

import OutletLayout from "../../layouts/outletLayout/OutletLayout";
import Loader from "../../components/loader/Loader";
import ViewDocModal from "../../components/modals/clientModal/viewDocModal/ViewDocModal";
import NoRecordFound from "../../components/noRecordFound/NoRecordFound";
import Table from "../../components/table/Table";
import CustomPagination from "../../components/customPagination/CustomPagination";
import Button from "../../components/button/Button";
import SearchBar from "../../components/searchBar/SearchBar";

import {
  isModalDeleteReducer,
  isModalShowReducser,
} from "../../redux/slices/ModalSlice";

import { IoMdAdd } from "react-icons/io";
import ViewAddDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/ViewAddDocumentModal";
import DeleteDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/deleteDocumentModal/DeleteDocumentModal";

import { useDebounce } from "../../hook/useDebounce";
import { filterDocuments } from "../../utils/FilteredDocuments";
import DocumentItem, { PreviewKind } from "./DocumentItem";

const heading = ["document", "type", "date", "action"];

const AllDocuments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const deleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );
  const showAddDocumentModal = useSelector(
    (state: RootState) => state.modalSlice.isAddDocumentModalShow,
  );

  const clientId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // NEW: preview mode state
  const [previewKind, setPreviewKind] = useState<PreviewKind>("html");
  const [selectedDocHtml, setSelectedDocHtml] = useState<string>("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>("");

  const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(
    null,
  );
  const [isFormToDelete, setIsFormToDelete] = useState(false);

  const [dataSendToViewDocModal, setDataSendToViewDocModal] =
    useState<DocModalData>({
      clientId: "",
      providerId: "",
      documentId: "",
      sharedDocumentId: "",
      eSignature: "",
      isAgree: false,
      recipientId: "",
    });

  const {
    data: documentData = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["documents", clientId],
    enabled: Boolean(clientId),
    queryFn: async () => {
      const response = await documentApiService.getAllDocuments(clientId);
      return response?.data?.data?.allDocuments || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: formData = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: async () => {
      const res = await axiosInstance.get("/form/templates");
      return res.data.data.templates || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const combinedData = useMemo(() => {
    const docs = Array.isArray(documentData)
      ? documentData.map((d: any) => ({ ...d, isForm: false }))
      : [];
    const forms = Array.isArray(formData)
      ? formData.map((f: any) => ({
          ...f,
          isForm: true,
          name: f.title, // Map title to name for display consistency
          type: "Form Template",
        }))
      : [];
    return [...docs, ...forms];
  }, [documentData, formData]);

  const filteredDocuments = useMemo(() => {
    return filterDocuments(combinedData, debouncedSearchTerm);
  }, [combinedData, debouncedSearchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: filteredDocuments,
      recordPerPage: 7,
    });

  const handleShowPreview = (
    docHtml: string,
    pdfUrl: string,
    kind: PreviewKind,
    dataModal: any,
  ) => {
    setPreviewKind(kind);
    setSelectedPdfUrl(pdfUrl);
    setSelectedDocHtml(docHtml);
    setDataSendToViewDocModal(dataModal);
    dispatch(isModalShowReducser(true));
  };

  const handleDelete = (id: string, isForm: boolean) => {
    setDocumentIdToDelete(id);
    setIsFormToDelete(isForm);
    dispatch(isModalDeleteReducer(true));
  };

  return (
    <OutletLayout
      heading="Documents"
      button={
        <Button
          text="Add New"
          onclick={() => navigate("/create-template")}
          icon={<IoMdAdd />}
        />
      }
    >
      {(isLoading || isFetching) && <Loader text="Loading Documents..." />}

      {showAddDocumentModal && (
        <ViewAddDocumentModal
          sharedDocs={selectedDocHtml}
          isOnlyRead
          data={dataSendToViewDocModal as documentSignByClientType}
        />
      )}

      {deleteModal && documentIdToDelete && (
        <DeleteDocumentModal
          documentId={documentIdToDelete}
          isForm={isFormToDelete}
        />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDocHtml}
          isOnlyRead
          data={dataSendToViewDocModal as documentSignByClientType}
          previewKind={previewKind}
          pdfUrl={selectedPdfUrl}
        />
      )}

      <div className="flex items-center justify-end mt-4">
        <div className="w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, type, date, etc..."
          />
        </div>
      </div>

      <div className="mt-10 w-full">
        {getCurrentRecords()?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {getCurrentRecords()?.map((doc: any) => (
                <DocumentItem
                  key={doc?.id}
                  doc={doc}
                  onShowPreview={handleShowPreview}
                  onDelete={handleDelete}
                />
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
