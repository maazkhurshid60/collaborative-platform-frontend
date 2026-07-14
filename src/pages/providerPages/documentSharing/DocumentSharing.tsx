import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { toast } from "react-toastify";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";
import Table from "../../../components/table/Table";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import usePaginationHook from "../../../hook/usePaginationHook";

import { isMultiClientDocShareModalReducer } from "../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { MasterDocument } from "../../../types/documentType/DocumentType";
import DocumentItem from "./DocumentItem";
import { summarize } from "../../../utils/documentUtils";

import { useDocumentData } from "../../../hooks/useDocumentData";
import { useDocumentModals } from "../../../hooks/useDocumentModals";
import { DocumentSharingModals } from "./components/DocumentSharingModals";
import { DocumentSharingToolbar } from "./components/DocumentSharingToolbar";

const recordPerPage = 10;
const heading = ["", "#", "Document", "Type", "Status", "Created", "Action"];

const DocumentSharing = () => {
  const dispatch = useDispatch<AppDispatch>();

  const loginUserDetail = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const providerId = loginUserDetail?.id;
  const loginUserId = loginUserDetail?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const { combinedDocs, myClients, docsLoading, docsError } = useDocumentData(
    providerId,
    loginUserId,
  );

  const {
    isMultiClientDocShareModal,
    isDocumentRecipientsModal,
    isClientCompleteDocModal,
    showModal,
    modalData,
    activeDocForModal,
    handleViewDocument,
    handleViewRecipients,
    handleViewSigned,
  } = useDocumentModals(providerId, combinedDocs);

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
      <DocumentSharingModals
        isMultiClientDocShareModal={isMultiClientDocShareModal}
        isDocumentRecipientsModal={isDocumentRecipientsModal}
        isClientCompleteDocModal={isClientCompleteDocModal}
        showModal={showModal}
        modalData={modalData}
        activeDocForModal={activeDocForModal}
        myClients={myClients}
        providerId={providerId}
        loginUserId={loginUserId}
        selectedDocs={selectedDocs}
        handleViewSigned={handleViewSigned}
        onShared={() => setSelectedDocIds([])}
      />

      <DocumentSharingToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        allOnPageSelected={allOnPageSelected}
        toggleSelectAllOnPage={toggleSelectAllOnPage}
        selectedDocIdsLength={selectedDocIds.length}
      />

      <div className="mt-4 w-full">
        {pageRecords.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {pageRecords.map((doc: any, rowIndex: number) => {
                const serialNo =
                  (currentPage - 1) * recordPerPage + rowIndex + 1;
                const { signed, sharedOnly } = summarize(doc, providerId);
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
