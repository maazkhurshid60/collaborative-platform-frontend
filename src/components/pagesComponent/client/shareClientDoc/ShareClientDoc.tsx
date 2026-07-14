import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { AppDispatch, RootState } from "@/redux/store";

import Loader from "@/components/loader/Loader";
import ModalLayout from "@/components/modals/modalLayout/ModalLayout";
import ProviderFormFillStep from "@/components/modals/providerModal/multiClientDocShareModal/ProviderFormFillStep";
import ClientCompleteDocShareModal from "@/components/modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal";
import ViewDocModal from "@/components/modals/clientModal/viewDocModal/ViewDocModal";
import Checkbox from "@/components/checkbox/Checkbox";
import SearchBar from "@/components/searchBar/SearchBar";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";
import Table from "@/components/table/Table";
import CustomPagination from "@/components/customPagination/CustomPagination";
import { ShareClientDocRow } from "./ShareClientDocRow";
import Button from "@/components/button/Button";
import { useDocumentData } from "@/hooks/useDocumentData";
import { isModalShowReducser } from "@/redux/slices/ModalSlice";
import axiosInstance from "@/apiServices/axiosInstance/AxiosInstance";
import documentApiService from "@/apiServices/documentApi/DocumentApi";
import { documentSignByClientType } from "@/types/documentType/DocumentType";

interface ShareClientDocProps {
  clientId: string;
  recipientId?: string;
  clientEmail?: string;
}

const recordPerPage = 10;
const heading = ["", "#", "Document", "Type", "Status", "Created", "Action"];

const ShareClientDoc: React.FC<ShareClientDocProps> = ({
  clientId,
  recipientId,
  clientEmail,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<
    "CONFIRM_SHARE" | "FILL_FORMS" | "VIEW" | null
  >(null);

  const [modalData, setModalData] = useState<{
    docForRecipients: any | null;
    selectedDocHtml: string;
    dataSendToViewDocModal: any;
  }>({
    docForRecipients: null,
    selectedDocHtml: "",
    dataSendToViewDocModal: {
      clientId: "",
      providerId: "",
      documentId: "",
    },
  });

  const [selectedCompletedDoc, setSelectedCompletedDoc] = useState<
    any | undefined
  >(undefined);

  const { isModalShow, isClientCompleteDocModal } = useSelector(
    (state: RootState) => state.modalSlice,
  );

  const providerId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );
  const loginUserId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.user.id,
  );

  // Fetch all form templates and master documents via the shared hook
  const { combinedDocs = [], docsLoading } = useDocumentData(
    providerId,
    loginUserId,
  );

  // Filter combined documents by search term
  const filteredDocs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return combinedDocs;
    return combinedDocs.filter(
      (d) =>
        d.name?.toLowerCase().includes(term) ||
        d.type?.toLowerCase().includes(term),
    );
  }, [combinedDocs, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDocs.length / recordPerPage) || 1;
  const pageRecords = useMemo(() => {
    const start = (currentPage - 1) * recordPerPage;
    return filteredDocs.slice(start, start + recordPerPage);
  }, [filteredDocs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Selection helpers
  const toggleSelectDoc = (docId: string, checked: boolean) => {
    setSelectedDocIds((prev) =>
      checked ? [...prev, docId] : prev.filter((id) => id !== docId),
    );
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    const pageIds = pageRecords.map((d) => d.id) ?? [];
    setSelectedDocIds((prev) => {
      if (checked) {
        const merged = new Set([...prev, ...pageIds]);
        return Array.from(merged);
      }
      return prev.filter((id) => !pageIds.includes(id));
    });
  };

  const selectedDocs = useMemo(
    () => combinedDocs.filter((d) => selectedDocIds.includes(d.id)),
    [combinedDocs, selectedDocIds],
  );

  // Get status of a document specifically for THIS client
  const getDocStatus = (doc: any) => {
    if (doc.isForm) {
      const share = doc.shares?.find(
        (s: any) => s.clientId === clientId && s.providerId === providerId,
      );
      if (!share) return "NOT_SHARED";
      return share.status === "SUBMITTED" ? "COMPLETED" : "PENDING";
    } else {
      const share = doc.sharedWith?.find(
        (sw: any) => sw.clientId === clientId && sw.providerId === providerId,
      );
      if (!share) return "NOT_SHARED";
      return share.eSignature ? "COMPLETED" : "PENDING";
    }
  };

  // Share Mutation
  const shareMutation = useMutation({
    mutationFn: async (providerData: Record<string, any> = {}) => {
      const formIds = selectedDocs.filter((d) => d.isForm).map((d) => d.id);
      const docIds = selectedDocs.filter((d) => !d.isForm).map((d) => d.id);

      const promises: Promise<any>[] = [];

      if (docIds.length > 0) {
        promises.push(
          documentApiService.documentSharedWithClientApi(
            {
              providerId: providerId || "",
              clientId,
              documentId: docIds,
              recipientId: recipientId || "",
              senderId: loginUserId || "",
              clientEmail,
              title: "Document has shared",
            } as any,
            { silent: true },
          ),
        );
      }

      if (formIds.length > 0) {
        formIds.forEach((formId) => {
          promises.push(
            axiosInstance.post("/form/share", {
              templateId: formId,
              clientId,
              providerId,
              expirationDays: 7,
              providerData:
                Object.keys(providerData).length > 0 ? providerData : undefined,
            }),
          );
        });
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Documents shared successfully!");
      queryClient.invalidateQueries({ queryKey: ["master-documents"] });
      queryClient.invalidateQueries({ queryKey: ["form-templates"] });
      setSelectedDocIds([]);
      dispatch(isModalShowReducser(false));
      setActiveModal(null);
    },
    onError: (error: any) => {
      console.error("Error sharing documents:", error);
      toast.error(error?.response?.data?.error || "Failed to share documents");
    },
  });

  const handleOpenShareModal = () => {
    if (selectedDocIds.length === 0) {
      toast.warn("Select at least one document first");
      return;
    }

    const hasProviderSections = selectedDocs.some(
      (doc) =>
        doc.isForm &&
        doc.schema?.fields?.some((f: any) => f.type === "provider-section"),
    );

    if (hasProviderSections) {
      setActiveModal("FILL_FORMS");
    } else {
      setActiveModal("CONFIRM_SHARE");
    }
    dispatch(isModalShowReducser(true));
  };

  const allOnPageSelected =
    pageRecords.length > 0 &&
    pageRecords.every((d) => selectedDocIds.includes(d.id));

  // Simple share confirmation modal content
  const confirmShareBody = (
    <div className="mt-4">
      <p className="text-[14px] text-textGreyColor mb-4">
        Are you sure you want to share the selected documents with this client?
      </p>
      <p className="font-semibold text-[14px] mt-4 mb-4">Selected Documents</p>
      <div className="grid grid-cols-1 gap-3 mb-6 max-h-40 overflow-y-auto">
        {selectedDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-x-3 font-medium text-[14px] min-w-0"
          >
            <IoDocumentTextOutline className="text-primaryColorDark text-2xl shrink-0" />
            <span className="truncate">{doc.name}</span>
          </div>
        ))}
      </div>
      <Button
        text="Send"
        sm
        onclick={() => shareMutation.mutate({})}
        isLoading={shareMutation.isPending}
        disabled={shareMutation.isPending}
      />
    </div>
  );

  if (docsLoading) return <Loader text="Loading documents..." />;

  return (
    <div className="mt-6">
      {/* Modals rendering */}
      {isModalShow && activeModal === "CONFIRM_SHARE" && (
        <ModalLayout
          heading="Share Documents"
          modalBodyContent={confirmShareBody}
        />
      )}

      {isModalShow && activeModal === "FILL_FORMS" && (
        <ModalLayout
          heading="Share Documents"
          modalBodyContent={
            <ProviderFormFillStep
              forms={selectedDocs.filter((d) => d.isForm)}
              onBack={() => {
                dispatch(isModalShowReducser(false));
                setActiveModal(null);
              }}
              onSubmit={(data) => shareMutation.mutate(data)}
              isSubmitting={shareMutation.isPending}
            />
          }
          widthClass="w-[95%] max-w-4xl"
        />
      )}

      {isClientCompleteDocModal && (
        <ClientCompleteDocShareModal
          showDownloadButton
          completedDoc={selectedCompletedDoc}
          clientId={clientId}
        />
      )}

      {isModalShow && activeModal === "VIEW" && (
        <ViewDocModal
          sharedDocs={modalData.selectedDocHtml}
          isOnlyRead
          data={modalData.dataSendToViewDocModal as documentSignByClientType}
          previewKind="pdf"
          pdfUrl={modalData.dataSendToViewDocModal?.pdfUrl}
          heading={modalData.docForRecipients?.name || "Document Preview"}
        />
      )}

      {/* Toolbar & Send Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-x-4 w-full md:w-[60%]">
          <div className="w-3 h-6 flex items-center justify-center shrink-0">
            <Checkbox
              checked={allOnPageSelected}
              onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
            />
          </div>
          {selectedDocIds.length > 0 && (
            <span className="text-[12px] text-textColor font-semibold whitespace-nowrap">
              {selectedDocIds.length} selected
            </span>
          )}
          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Document Name"
            />
          </div>
        </div>

        <div className="w-full md:w-36 flex justify-end">
          <Button
            text={`Share${selectedDocIds.length ? ` (${selectedDocIds.length})` : ""}`}
            onclick={handleOpenShareModal}
            icon={<FaRegShareFromSquare />}
            sm
          />
        </div>
      </div>

      {/* Unified documents table */}
      <div className="mt-4 w-full">
        {pageRecords.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {pageRecords.map((doc: any, rowIndex: number) => {
                const serialNo =
                  (currentPage - 1) * recordPerPage + rowIndex + 1;
                const isSelected = selectedDocIds.includes(doc.id);
                const status = getDocStatus(doc);

                return (
                  <ShareClientDocRow
                    key={doc.id}
                    doc={doc}
                    serialNo={serialNo}
                    isSelected={isSelected}
                    status={status}
                    toggleSelectDoc={toggleSelectDoc}
                    clientId={clientId}
                    providerId={providerId}
                    recipientId={recipientId}
                    setModalData={setModalData}
                    setActiveModal={setActiveModal}
                    setSelectedCompletedDoc={setSelectedCompletedDoc}
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
    </div>
  );
};

export default ShareClientDoc;
