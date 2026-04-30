// DocumentRecipientsModal.tsx
//
// Opens from a row in the provider-side "Document Sharing" tab. The status
// pills on each row show counts ("3 shared · 1 signed") — clicking them lands
// the provider here so they can see exactly which clients signed and which
// are still pending.
//
// Recipients are fetched paginated from the backend (`GET /document/:id/recipients`)
// and rendered as a single ordered list — awaiting-signature rows first, signed
// rows after — with one pagination control at the bottom. Status is shown via
// per-row badges instead of section headers so paging across the boundary
// reads naturally.
//
// Clients who don't have the document at all are intentionally not listed
// here — that side of the picture lives in the share modal where the
// provider picks who to send to.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FiCheckCircle, FiClock, FiExternalLink } from "react-icons/fi";

import ModalLayout from "../../modalLayout/ModalLayout";
import CustomPagination from "../../../customPagination/CustomPagination";
import documentApiService from "../../../../apiServices/documentApi/DocumentApi";
import {
    DocumentRecipient,
    DocumentRecipientsResponse,
    MasterDocument,
} from "../../../../types/documentType/DocumentType";

const RECORDS_PER_PAGE = 8;

interface DocumentRecipientsModalProps {
    document: MasterDocument;
    /** Provider whose shares we're viewing — required by the recipients endpoint. */
    providerId: string;
    /**
     * Called when the provider clicks "View signed" on a signed row.
     * Parent is responsible for opening the signed-doc viewer modal
     * (ClientCompleteDocShareModal) filtered to that client.
     */
    onViewSigned?: (clientId: string) => void;
}

const ModalBody: React.FC<DocumentRecipientsModalProps> = ({
    document,
    providerId,
    onViewSigned,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data,
        isLoading,
        isError,
    } = useQuery<DocumentRecipientsResponse>({
        queryKey: ["document-recipients", document.id, providerId, currentPage],
        queryFn: async () => {
            const response = await documentApiService.getDocumentRecipients(
                document.id,
                providerId,
                currentPage,
                RECORDS_PER_PAGE
            );
            // ApiResponse wraps the payload — see notes in DocumentSharing.tsx
            return response?.data?.data ?? { recipients: [], pagination: { total: 0, page: 1, limit: RECORDS_PER_PAGE, totalPages: 1 } };
        },
        enabled: Boolean(document?.id && providerId),
        // Smoother pagination — keep showing previous page while next loads
        placeholderData: (prev) => prev,
    });

    const recipients: DocumentRecipient[] = data?.recipients ?? [];
    const pagination = data?.pagination;

    const renderRow = (row: DocumentRecipient) => (
        <div
            key={row.id}
            className="flex items-center gap-x-3 p-3 rounded-md border border-lightGreyColor"
        >
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[14px] capitalize truncate">
                    {row.fullName}
                </p>
                <span className="block text-[12px] text-textGreyColor lowercase truncate">
                    {row.email}
                </span>
            </div>

            {row.isSigned ? (
                <div className="flex items-center gap-x-2 shrink-0">
                    <span className="flex items-center gap-x-1 px-2 py-1 rounded text-[11px] font-medium bg-green-50 text-green-700">
                        <FiCheckCircle />
                        Signed
                    </span>
                    {/* Prominent action — opens the signed document with the client's signature */}
                    <button
                        type="button"
                        onClick={() => onViewSigned?.(row.clientId)}
                        className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-primaryColorDark text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                    >
                        <FiCheckCircle />
                        View signed
                    </button>
                </div>
            ) : (
                <span className="flex items-center gap-x-1 px-2 py-1 rounded text-[11px] font-medium bg-yellow-50 text-yellow-700 flex-shrink-0">
                    <FiClock />
                    Awaiting signature
                </span>
            )}
        </div>
    );

    return (
        <div className="mt-2">
            {/* Document header — shows the doc and a prominent "View document" action */}
            <div className="flex items-center gap-x-3 mb-4">
                <IoDocumentTextOutline className="text-primaryColorDark text-2xl flex-shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[14px] truncate" title={document.name}>
                        {document.name}
                    </p>
                    <p className="text-[12px] text-textGreyColor capitalize">
                        {document.type ?? "Document"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        window.open(document.url, "_blank", "noopener,noreferrer")
                    }
                    className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-primaryColorDark text-primaryColorDark hover:bg-primaryColorDark/5 transition-colors cursor-pointer flex-shrink-0"
                >
                    <FiExternalLink />
                    View document
                </button>
            </div>

            <hr className="text-textGreyColor/30 h-[2px] mb-4" />

            {/* Counts header — useful context once a paginated list breaks
                across the awaiting/signed boundary. */}
            {pagination && pagination.total > 0 && (
                <p className="text-[12px] text-textGreyColor mb-3">
                    Showing {(pagination.page - 1) * pagination.limit + 1}
                    –{Math.min(pagination.page * pagination.limit, pagination.total)} of
                    {" "}{pagination.total} recipient{pagination.total === 1 ? "" : "s"}
                </p>
            )}

            {/* States */}
            {isLoading ? (
                <p className="text-[13px] text-textGreyColor py-6 text-center">
                    Loading recipients...
                </p>
            ) : isError ? (
                <p className="text-[13px] text-redColor py-6 text-center">
                    Couldn't load recipients. Please try again.
                </p>
            ) : recipients.length === 0 ? (
                <p className="text-[13px] text-textGreyColor py-6 text-center">
                    No clients have this document yet.
                </p>
            ) : (
                <>
                    <div className="flex flex-col gap-y-2 mb-2">
                        {recipients.map(renderRow)}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-4">
                            <CustomPagination
                                totalPages={pagination.totalPages}
                                onPageChange={(page: number) => setCurrentPage(page)}
                                hookCurrentPage={pagination.page}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const DocumentRecipientsModal: React.FC<DocumentRecipientsModalProps> = (props) => {
    return (
        <ModalLayout
            heading="Document Recipients"
            modalBodyContent={<ModalBody {...props} />}
        />
    );
};

export default DocumentRecipientsModal;
