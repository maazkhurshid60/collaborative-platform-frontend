// DocumentSharing.tsx
// Provider-side "Document Sharing" tab.
//
// This is doc-first (vs. the existing per-client `ShareClientDoc` flow which is
// client-first — that flow stays untouched). The provider picks documents from
// the master library, then opens the share modal to pick which clients get them.
//
// Status is per-(document, client) pair. We don't try to summarise it into a
// single badge per row — instead the modal renders a per-client breakdown so
// the provider can see exactly what's already shared / signed before sending.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";
import SearchBar from "../../../components/searchBar/SearchBar";
import Table from "../../../components/table/Table";
import Checkbox from "../../../components/checkbox/Checkbox";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import ViewIcon from "../../../components/icons/view/View";
import usePaginationHook from "../../../hook/usePaginationHook";

import documentApiService from "../../../apiServices/documentApi/DocumentApi";
import clientApiService from "../../../apiServices/clientApi/ClientApi";
import {
    isMultiClientDocShareModalReducer,
    isDocumentRecipientsModalReducer,
    isClientCompleteDocModalReducer,
} from "../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { MasterDocument } from "../../../types/documentType/DocumentType";
import { ClientType } from "../../../types/clientType/ClientType";
import { toast } from "react-toastify";

import MultiClientDocShareModal from "../../../components/modals/providerModal/multiClientDocShareModal/MultiClientDocShareModal";
import DocumentRecipientsModal from "../../../components/modals/providerModal/documentRecipientsModal/DocumentRecipientsModal";
import ClientCompleteDocShareModal from "../../../components/modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal";

const recordPerPage = 10;

const DocumentSharing = () => {
    const dispatch = useDispatch<AppDispatch>();

    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails);
    const providerId = loginUserDetail?.id;
    const loginUserId = loginUserDetail?.user?.id;

    const isMultiClientDocShareModal = useSelector(
        (state: RootState) => state.modalSlice.isMultiClientDocShareModal
    );
    const isDocumentRecipientsModal = useSelector(
        (state: RootState) => state.modalSlice.isDocumentRecipientsModal
    );
    // Reuses the existing per-client signed-doc viewer modal flag.
    const isClientCompleteDocModal = useSelector(
        (state: RootState) => state.modalSlice.isClientCompleteDocModal
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [docForRecipients, setDocForRecipients] = useState<MasterDocument | null>(null);
    // When set, ClientCompleteDocShareModal renders the master doc filtered to
    // this client's signature (so the provider sees the signed version).
    const [signedViewClientId, setSignedViewClientId] = useState<string | null>(null);

    const {
        data: documents,
        isLoading: docsLoading,
        isError: docsError,
    } = useQuery<MasterDocument[]>({
        queryKey: ["master-documents", providerId],
        queryFn: async () => {
            const response = await documentApiService.getAllMasterDocuments(providerId);
            // ApiResponse wraps the controller payload, so the real shape is:
            //   response.data         → { message, data: { documents } }
            //   response.data.data    → { documents: [...] }
            // Match the convention used by getAllDocuments in ShareClientDoc.tsx.
            return response?.data?.data?.documents || [];
        },
        enabled: Boolean(providerId),
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
            clients?.filter((client) =>
                client?.providerList?.some((p) => p?.provider?.user?.id === loginUserId) ||
                client?.createdByProviderId === loginUserDetail?.id ||
                client?.createdByProviderId === loginUserId
            ) || []
        );
    }, [clients, loginUserId, loginUserDetail?.id]);

    // ----- Filtering + pagination -----
    const filteredDocs = useMemo(() => {
        if (!documents) return [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return documents;
        return documents.filter(
            (d) =>
                d.name?.toLowerCase().includes(term) ||
                d.type?.toLowerCase().includes(term)
        );
    }, [documents, searchTerm]);

    const { totalPages, getCurrentRecords, handlePageChange, currentPage } = usePaginationHook({
        data: filteredDocs,
        recordPerPage,
    });

    // ----- Selection helpers -----
    const toggleSelectDoc = (docId: string, checked: boolean) => {
        setSelectedDocIds((prev) =>
            checked ? [...prev, docId] : prev.filter((id) => id !== docId)
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
        () => (documents ?? []).filter((d) => selectedDocIds.includes(d.id)),
        [documents, selectedDocIds]
    );

    // ----- Per-row status summary -----
    // Aggregates the joined `sharedWith` rows into a quick "X shared · Y signed"
    // hint for the table. Detailed per-client status lives in the modal.
    const summarise = (doc: MasterDocument) => {
        const rows = doc.sharedWith ?? [];
        const signed = rows.filter((r) => Boolean(r.eSignature)).length;
        const sharedOnly = rows.length - signed;
        return { signed, sharedOnly, total: rows.length };
    };

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

    /** Open the doc's URL in a new tab — most are PDFs the browser renders inline. */
    const handleViewDocument = (doc: MasterDocument) => {
        if (!doc.url) {
            toast.error("This document has no preview URL");
            return;
        }
        window.open(doc.url, "_blank", "noopener,noreferrer");
    };

    /** Show the per-client signed/awaiting breakdown for a single document. */
    const handleViewRecipients = (doc: MasterDocument) => {
        setDocForRecipients(doc);
        dispatch(isDocumentRecipientsModalReducer(true));
    };

    /**
     * Open the existing signed-document viewer (`ClientCompleteDocShareModal`)
     * filtered to a specific client's signature. We close the recipients
     * modal first so the two modals don't stack visually.
     */
    const handleViewSigned = (clientId: string) => {
        setSignedViewClientId(clientId);
        dispatch(isDocumentRecipientsModalReducer(false));
        dispatch(isClientCompleteDocModalReducer(true));
    };

    if (docsLoading) return <Loader text="Loading..." />;
    if (docsError) return <p>something went wrong</p>;

    const heading = ["", "#", "Document", "Type", "Status", "Created", "Action"];

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

            {isDocumentRecipientsModal && docForRecipients && providerId && (
                <DocumentRecipientsModal
                    document={docForRecipients}
                    providerId={providerId}
                    onViewSigned={handleViewSigned}
                />
            )}

            {isClientCompleteDocModal && docForRecipients && signedViewClientId && (
                <ClientCompleteDocShareModal
                    showDownloadButton
                    completedDoc={docForRecipients as any}
                    clientId={signedViewClientId}
                />
            )}

            <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
                <p className="text-[14px] text-textGreyColor">
                    Pick documents from the library, then choose which clients to share them with.
                    Already-shared documents are skipped automatically.
                </p>
                <div className="w-[40%] min-w-[260px]">
                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by document name or type..."
                    />
                </div>
            </div>

            {/* Selection toolbar — sits above the table because the existing
                Table component only accepts a string[] heading. */}
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
                            {pageRecords.map((doc: MasterDocument, rowIndex: number) => {
                                const serialNo = (currentPage - 1) * recordPerPage + rowIndex + 1;
                                const { signed, sharedOnly } = summarise(doc);
                                const isSelected = selectedDocIds.includes(doc.id);

                                // All <td> cells use `px-4 py-3 align-middle` to match the
                                // Table component's <th> padding (px-4 py-3 text-left) so
                                // the header text aligns visually with the cell contents on
                                // tablet/desktop widths.
                                return (
                                    <tr
                                        key={doc.id}
                                        className="border-b border-b-solid border-b-lightGreyColor"
                                    >
                                        {/* Checkbox */}
                                        <td className="px-4 py-3 align-middle w-[44px]">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={(e) => toggleSelectDoc(doc.id, e.target.checked)}
                                            />
                                        </td>

                                        {/* S.No */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap w-[40px]">
                                            {serialNo}
                                        </td>

                                        {/* Document — responsive truncation so larger tablets
                                            don't waste horizontal space, but smaller widths
                                            still keep the row from blowing up. */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-x-3 min-w-0">
                                                <IoDocumentTextOutline className="text-primaryColorDark text-2xl flex-shrink-0" />
                                                <span
                                                    className="block truncate font-medium text-[14px] max-w-[180px] sm:max-w-[240px] lg:max-w-[320px] xl:max-w-[420px]"
                                                    title={doc.name}
                                                >
                                                    {doc.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap capitalize">
                                            {doc.type ?? "-"}
                                        </td>

                                        {/* Status pills — single line so paged rows have
                                            consistent height even on narrow tablets. */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewRecipients(doc)}
                                                title="See which clients signed and which are awaiting"
                                                className="inline-flex items-center gap-x-2 cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                                            >
                                                <span className="px-3 py-1 rounded-md text-xs font-medium bg-primaryColorDark/10 text-primaryColorDark">
                                                    {sharedOnly} shared
                                                </span>
                                                <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                                    {signed} signed
                                                </span>
                                            </button>
                                        </td>

                                        {/* Created */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap text-textGreyColor text-[13px]">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Action — left-aligned so the icon sits under the
                                            "Action" header (which is text-left in <th>). */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                                            <div className="flex items-center justify-start gap-x-1.5">
                                                <div className="w-5 h-5 flex items-center justify-center">
                                                    <ViewIcon onClick={() => handleViewDocument(doc)} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
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
