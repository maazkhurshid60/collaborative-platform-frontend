import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { FaRegShareFromSquare } from "react-icons/fa6";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";
import SearchBar from "../../../components/searchBar/SearchBar";
import Table from "../../../components/table/Table";
import Checkbox from "../../../components/checkbox/Checkbox";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import usePaginationHook from "../../../hook/usePaginationHook";

import documentApiService from "../../../apiServices/documentApi/DocumentApi";
import clientApiService from "../../../apiServices/clientApi/ClientApi";
import {
  isMultiClientDocShareModalReducer,
  isDocumentRecipientsModalReducer,
  isClientCompleteDocModalReducer,
  isModalShowReducser,
} from "../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  MasterDocument,
  documentSignByClientType,
} from "../../../types/documentType/DocumentType";
import { ClientType } from "../../../types/clientType/ClientType";
import { toast } from "react-toastify";
import axiosInstance from "../../../apiServices/axiosInstance/AxiosInstance";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import { generateFormPdfUrl } from "../../../pdf/utils/pdfHelpers";
import DocumentItem from "./DocumentItem";
import { summarize } from "../../../utils/documentUtils";

import MultiClientDocShareModal from "../../../components/modals/providerModal/multiClientDocShareModal/MultiClientDocShareModal";
import DocumentRecipientsModal from "../../../components/modals/providerModal/documentRecipientsModal/DocumentRecipientsModal";
import ClientCompleteDocShareModal from "../../../components/modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal";

const recordPerPage = 10;
const heading = ["", "#", "Document", "Type", "Status", "Created", "Action"];

const DocumentSharing = () => {
  const dispatch = useDispatch<AppDispatch>();

  const loginUserDetail = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const providerId = loginUserDetail?.id;
  const loginUserId = loginUserDetail?.user?.id;

  const isMultiClientDocShareModal = useSelector(
    (state: RootState) => state.modalSlice.isMultiClientDocShareModal,
  );
  const isDocumentRecipientsModal = useSelector(
    (state: RootState) => state.modalSlice.isDocumentRecipientsModal,
  );
  // Reuses the existing per-client signed-doc viewer modal flag.
  const isClientCompleteDocModal = useSelector(
    (state: RootState) => state.modalSlice.isClientCompleteDocModal,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [modalData, setModalData] = useState<{
    docForRecipients: MasterDocument | null;
    recipientsFilterStatus?: "signed" | "awaiting";
    signedViewClientId: string | null;
    selectedDocHtml: string;
    dataSendToViewDocModal: any;
  }>({
    docForRecipients: null,
    recipientsFilterStatus: undefined,
    signedViewClientId: null,
    selectedDocHtml: "",
    dataSendToViewDocModal: {
      clientId: "",
      providerId: "",
      documentId: "",
    },
  });

  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );

  const {
    data: documents,
    isLoading: docsLoading,
    isError: docsError,
  } = useQuery<MasterDocument[]>({
    queryKey: ["master-documents", providerId],
    queryFn: async () => {
      const response =
        await documentApiService.getAllMasterDocuments(providerId);
      return response?.data?.data?.documents || [];
    },
    enabled: Boolean(providerId),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["form-templates"],
    queryFn: async () => {
      const response = await axiosInstance.get("/form/templates");
      return response.data.data.templates || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // ----- Provider's clients (for the modal) -----
  const { data: clients } = useQuery<ClientType[]>({
    queryKey: ["clients", loginUserId],
    queryFn: async () => {
      const response = await clientApiService.getAllClient(loginUserId);
      return response?.data?.clients || [];
    },
    enabled: Boolean(loginUserId),
  });

  // Match the existing logic in Clients.tsx for "my clients"
  const myClients = useMemo(() => {
    return (
      clients?.filter(
        (client) =>
          client?.providerList?.some(
            (p) => p?.provider?.user?.id === loginUserId,
          ) ||
          client?.createdByProviderId === loginUserDetail?.id ||
          client?.createdByProviderId === loginUserId,
      ) || []
    );
  }, [clients, loginUserId, loginUserDetail?.id]);

  // ----- Combine documents and forms -----
  const combinedDocs = useMemo(() => {
    const docs = Array.isArray(documents)
      ? documents.map((d) => ({ ...d, isForm: false }))
      : [];
    const frms = Array.isArray(forms)
      ? forms.map((f: any) => ({
          ...f,
          isForm: true,
          name: f.title, // Map title to name for display consistency
          type: "Form Template",
        }))
      : [];
    return [...docs, ...frms];
  }, [documents, forms]);

  // ----- Filtering + pagination -----
  const filteredDocs = useMemo(() => {
    if (!combinedDocs) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return combinedDocs;
    return combinedDocs.filter(
      (d) =>
        d.name?.toLowerCase().includes(term) ||
        d.type?.toLowerCase().includes(term),
    );
  }, [combinedDocs, searchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: filteredDocs,
      recordPerPage,
    });

  // ----- Selection helpers -----
  const toggleSelectDoc = (docId: string, checked: boolean) => {
    setSelectedDocIds((prev) =>
      checked ? [...prev, docId] : prev.filter((id) => id !== docId),
    );
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    const pageIds = getCurrentRecords()?.map((d: MasterDocument) => d.id) ?? [];
    setSelectedDocIds((prev) => {
      if (checked) {
        const merged = new Set([...prev, ...pageIds]);
        return Array.from(merged);
      }
      return prev.filter((id) => !pageIds.includes(id));
    });
  };

  const selectedDocs = useMemo(
    () => (combinedDocs ?? []).filter((d) => selectedDocIds.includes(d.id)),
    [combinedDocs, selectedDocIds],
  );

  const handleOpenShareModal = () => {
    if (selectedDocIds.length === 0) {
      toast.warn("Select at least one document first");
      return;
    }
    if (myClients.length === 0) {
      toast.warn("You don't have any clients to share with yet");
      return;
    }
    dispatch(isMultiClientDocShareModalReducer(true));
  };

  const handleViewDocument = (doc: any) => {
    if (doc.isForm) {
      handleViewForm(doc);
      return;
    }
    if (!doc.url) {
      toast.error("This document has no preview URL");
      return;
    }
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const handleViewForm = async (doc: any) => {
    try {
      const url = await generateFormPdfUrl(doc);

      setModalData((prev) => ({
        ...prev,
        docForRecipients: doc,
        selectedDocHtml: "",
        dataSendToViewDocModal: {
          clientId: "",
          providerId: "",
          documentId: doc.id,
          recipientId: "",
          sharedDocumentId: "",
          eSignature: "",
          isAgree: false,
          pdfUrl: url,
        },
      }));
      dispatch(isModalShowReducser(true));
    } catch (error) {
      console.error("Error in handleViewForm:", error);
      toast.error("Unable to view form.");
    }
  };
  const handleViewRecipients = (
    doc: MasterDocument,
    filterStatus?: "signed" | "awaiting",
  ) => {
    setModalData((prev) => ({
      ...prev,
      docForRecipients: doc,
      recipientsFilterStatus: filterStatus,
    }));
    dispatch(isDocumentRecipientsModalReducer(true));
  };

  const handleViewSigned = async (clientId: string, submission?: any) => {
    dispatch(isDocumentRecipientsModalReducer(false));
    if (modalData.docForRecipients?.isForm) {
      try {
        const submissionData = submission?.data || {};
        const signature = submission?.signature || null;
        const url = await generateFormPdfUrl(
          modalData.docForRecipients as any,
          submissionData,
          signature,
        );

        setModalData((prev) => ({
          ...prev,
          selectedDocHtml: "",
          dataSendToViewDocModal: {
            clientId: clientId,
            providerId: providerId || "",
            documentId: modalData.docForRecipients?.id || "",
            recipientId: "",
            sharedDocumentId: "",
            eSignature: signature || "",
            isAgree: true,
            pdfUrl: url,
          },
        }));
        dispatch(isModalShowReducser(true));
      } catch (error) {
        console.error("Error displaying submitted form:", error);
        toast.error("Failed to display form submission.");
      }
    } else {
      setModalData((prev) => ({ ...prev, signedViewClientId: clientId }));
      dispatch(isClientCompleteDocModalReducer(true));
    }
  };

  if (docsLoading) return <Loader text="Loading..." />;
  if (docsError) return <p>something went wrong</p>;

  const pageRecords = getCurrentRecords() ?? [];
  const allOnPageSelected =
    pageRecords.length > 0 &&
    pageRecords.every((d: MasterDocument) => selectedDocIds.includes(d.id));

  return (
    <OutletLayout
      heading="Document Sharing"
      button={
        <Button
          text={`Share${selectedDocIds.length ? ` (${selectedDocIds.length})` : ""}`}
          onclick={handleOpenShareModal}
          icon={<FaRegShareFromSquare />}
        />
      }
    >
      {isMultiClientDocShareModal && (
        <MultiClientDocShareModal
          selectedDocs={selectedDocs}
          clients={myClients}
          providerId={providerId}
          senderId={loginUserId}
          onShared={() => setSelectedDocIds([])}
        />
      )}

      {isDocumentRecipientsModal &&
        modalData.docForRecipients &&
        providerId && (
          <DocumentRecipientsModal
            document={modalData.docForRecipients}
            providerId={providerId}
            onViewSigned={handleViewSigned}
            initialStatus={modalData.recipientsFilterStatus}
          />
        )}

      {isClientCompleteDocModal &&
        modalData.docForRecipients &&
        modalData.signedViewClientId && (
          <ClientCompleteDocShareModal
            showDownloadButton
            completedDoc={modalData.docForRecipients as any}
            clientId={modalData.signedViewClientId}
          />
        )}

      {showModal && (
        <ViewDocModal
          sharedDocs={modalData.selectedDocHtml}
          isOnlyRead
          data={modalData.dataSendToViewDocModal as documentSignByClientType}
          previewKind={
            modalData.docForRecipients?.isForm
              ? "pdf"
              : modalData.dataSendToViewDocModal?.pdfUrl
                ? "pdf"
                : "html"
          }
          pdfUrl={modalData.dataSendToViewDocModal?.pdfUrl}
          heading={
            modalData.docForRecipients?.isForm
              ? modalData.docForRecipients.name || "Form Template"
              : "Document Preview"
          }
        />
      )}

      <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
        <p className="text-[14px] text-textGreyColor">
          Pick documents from the library, then choose which clients to share
          them with. Already-shared documents are skipped automatically.
        </p>
        <div className="w-[40%] min-w-[260px]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by document name or type..."
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <Checkbox
          checked={allOnPageSelected}
          onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
          text={
            allOnPageSelected
              ? "Deselect all on this page"
              : "Select all on this page"
          }
        />
        {selectedDocIds.length > 0 && (
          <p className="text-[13px] text-textGreyColor">
            {selectedDocIds.length} document
            {selectedDocIds.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>

      <div className="mt-4 w-full">
        {pageRecords.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {pageRecords.map((doc: any, rowIndex: number) => {
                const serialNo =
                  (currentPage - 1) * recordPerPage + rowIndex + 1;
                const { signed, sharedOnly } = summarize(doc);
                const isSelected = selectedDocIds.includes(doc.id);

                return (
                  <DocumentItem
                    key={doc.id}
                    doc={doc}
                    serialNo={serialNo}
                    isSelected={isSelected}
                    signed={signed}
                    sharedOnly={sharedOnly}
                    toggleSelectDoc={toggleSelectDoc}
                    handleViewRecipients={handleViewRecipients}
                    handleViewDocument={handleViewDocument}
                  />
                );
              })}
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

export default DocumentSharing;
