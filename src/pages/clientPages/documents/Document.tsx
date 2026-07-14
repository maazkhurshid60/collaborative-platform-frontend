import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import { RootState } from "../../../redux/store";
import documentApiService from "../../../apiServices/documentApi/DocumentApi";
import axiosInstance from "../../../apiServices/axiosInstance/AxiosInstance";

import {
  DocModalData,
  documentSignByClientType,
  DocumentType,
} from "../../../types/documentType/DocumentType";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Loader from "../../../components/loader/Loader";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterDocuments } from "../../../utils/FilteredDocuments";
import SignedDocModal from "../../../components/modals/clientModal/viewDocModal/SignedDocModal";
import DeleteExpiredShareModal from "../../../components/modals/clientModal/DeleteExpiredShareModal";
import { DocumentRow } from "./DocumentRow";

const heading = ["document", "type", "status", "date", "Shared by", "action"];

const Document = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [previewKind, setPreviewKind] = useState<
    "html" | "pdf" | "image" | undefined
  >(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [dataSendToSignedDocModal, setDataSendToSignedDocModal] = useState<
    DocumentType | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const isshowSignedDocumentModal = useSelector(
    (state: RootState) => state.modalSlice.isshowSignedDocumentModal,
  );
  const clientId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );

  const { data: documentData, isLoading: isDocLoading } = useQuery<
    DocumentType[]
  >({
    queryKey: ["documents"],
    queryFn: async () => {
      const response =
        await documentApiService.getAllSharedDocumentWithClientApi(clientId);
      return response?.data?.data || [];
    },
    retry: 1,
    refetchOnWindowFocus: true, // Auto-refresh when client returns to the tab
  });

  const { data: formsData = [] } = useQuery({
    queryKey: ["shared-forms", clientId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/form/client/${clientId}`);
      return response.data.data.shares || [];
    },
    enabled: Boolean(clientId),
    retry: 1,
    refetchOnWindowFocus: true, // Auto-refresh when client returns to the tab
  });

  const combinedDocuments = useMemo(() => {
    const docs = Array.isArray(documentData)
      ? documentData.map((d) => ({ ...d, isForm: false }))
      : [];
    const frms = Array.isArray(formsData)
      ? formsData.map((f: any) => ({
          ...f,
          isForm: true,
          document: {
            name: f.template?.title || "Form Template",
            type: "Form Template",
            url: f.submission?.pdfUrl || "",
          },
          isAgree: f.status === "SUBMITTED", // "SUBMITTED" is the locked status set by the backend
          createdAt: f.createdAt,
          token: f.token,
        }))
      : [];
    return [...docs, ...frms];
  }, [documentData, formsData]);

  const filteredDocuments = filterDocuments(
    combinedDocuments || ([] as any),
    searchTerm,
  );

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: Array.isArray(filteredDocuments) ? filteredDocuments : [],
      recordPerPage: 7,
    });

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

  useEffect(() => {
    if (!showModal) {
      setSelectedDoc("");
      setPreviewKind(undefined);
      setPdfUrl(undefined);
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
    <OutletLayout heading="Documents">
      {isDocLoading && <Loader text="Loading Document..." />}

      {isshowSignedDocumentModal && (
        <SignedDocModal
          completedDoc={dataSendToSignedDocModal}
          clientId={clientId}
          showDownloadButton
        />
      )}

      {deleteTarget && (
        <DeleteExpiredShareModal
          shareId={deleteTarget.id}
          documentName={deleteTarget.name}
          clientId={clientId}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDoc}
          data={dataSendToViewDocModal as documentSignByClientType}
          previewKind={previewKind as any}
          pdfUrl={pdfUrl}
        />
      )}
      <div className="flex items-center justify-end mt-4">
        <div className="w-[40%] ">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name"
          />{" "}
        </div>
      </div>

      <div className="mt-10 w-full">
        {getCurrentRecords()?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {getCurrentRecords()?.map((data: any, index: number) => (
                <DocumentRow
                  key={data.id || index}
                  data={data}
                  index={index}
                  onDeleteClick={(id, name) => setDeleteTarget({ id, name })}
                  setSelectedDoc={setSelectedDoc}
                  setPreviewKind={setPreviewKind}
                  setPdfUrl={setPdfUrl}
                  setDataSendToViewDocModal={setDataSendToViewDocModal}
                  setDataSendToSignedDocModal={setDataSendToSignedDocModal}
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

export default Document;
