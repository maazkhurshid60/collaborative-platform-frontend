import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { IoDocumentTextOutline } from "react-icons/io5";
import {
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiTrash2,
} from "react-icons/fi";

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
  providerId: string;
  onViewSigned?: (clientId: string, submission?: any) => void;
  initialStatus?: "signed" | "awaiting";
}

const ModalBody: React.FC<DocumentRecipientsModalProps> = ({
  document,
  providerId,
  onViewSigned,
  initialStatus,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    "signed" | "awaiting" | undefined
  >(initialStatus);
  const queryClient = useQueryClient();

  const isFormUpdated =
    document.isForm &&
    document.updatedAt &&
    document.createdAt &&
    new Date(document.updatedAt).getTime() -
      new Date(document.createdAt).getTime() >
      1000;

  const docUpdatedTime = document.updatedAt
    ? new Date(document.updatedAt).getTime()
    : 0;
  const rows = document.shares || [];

  const hasPreviousSubmissions = rows.some((r: any) => {
    if (
      r.providerId === providerId &&
      r.status === "SUBMITTED" &&
      r.updatedAt
    ) {
      const shareUpdated = new Date(r.updatedAt).getTime();
      console.log("Checking submission:", {
        shareUpdated: new Date(r.updatedAt).toISOString(),
        docUpdated: new Date(docUpdatedTime).toISOString(),
        isBefore: shareUpdated < docUpdatedTime,
      });
      return shareUpdated < docUpdatedTime;
    }
    return false;
  });

  const showDeleteWarning = isFormUpdated && hasPreviousSubmissions;

  const deleteSubmissionsMutation = useMutation({
    mutationFn: () =>
      documentApiService.deleteProviderFormSubmissions(document.id, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-recipients"] });
      queryClient.invalidateQueries({ queryKey: ["master-documents"] });
      queryClient.invalidateQueries({ queryKey: ["form-templates"] });
    },
  });

  const { data, isLoading, isError } = useQuery<DocumentRecipientsResponse>({
    queryKey: [
      "document-recipients",
      document.id,
      providerId,
      currentPage,
      filterStatus,
    ],
    queryFn: async () => {
      const response = document.isForm
        ? await documentApiService.getFormTemplateRecipients(
            document.id,
            providerId,
            currentPage,
            RECORDS_PER_PAGE,
            filterStatus,
          )
        : await documentApiService.getDocumentRecipients(
            document.id,
            providerId,
            currentPage,
            RECORDS_PER_PAGE,
            filterStatus,
          );
      // ApiResponse wraps the payload — see notes in DocumentSharing.tsx
      return (
        response?.data?.data ?? {
          recipients: [],
          pagination: {
            total: 0,
            page: 1,
            limit: RECORDS_PER_PAGE,
            totalPages: 1,
          },
        }
      );
    },
    enabled: Boolean(document?.id && providerId),
    placeholderData: (prev) => prev,
  });

  const recipients: DocumentRecipient[] = data?.recipients ?? [];
  const pagination = data?.pagination;

  const renderRow = (row: DocumentRecipient) => (
    <div
      key={row.id}
      className="flex items-center gap-x-3 p-3 rounded-md border border-lightGreyColor bg-white shadow-sm"
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
          <span className="flex items-center gap-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-green-50 text-green-700">
            <FiCheckCircle />
            {document.isForm ? "Submitted" : "Signed"}
          </span>
          {/* Prominent action — opens the signed document or submitted form */}
          <button
            type="button"
            onClick={() =>
              onViewSigned?.(row.clientId, (row as any).submission)
            }
            className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold bg-primaryColorDark text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm border-0 outline-none"
          >
            <FiCheckCircle />
            {document.isForm ? "View submitted" : "View signed"}
          </button>
        </div>
      ) : (
        <span className="flex items-center gap-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-yellow-50 text-yellow-700 shrink-0">
          <FiClock />
          {document.isForm ? "Awaiting submission" : "Awaiting signature"}
        </span>
      )}
    </div>
  );

  const tabs = [
    { label: "All", value: undefined },
    { label: "Awaiting", value: "awaiting" as const },
    {
      label: document.isForm ? "Submitted" : "Signed",
      value: "signed" as const,
    },
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-x-3 mb-4">
        <IoDocumentTextOutline className="text-primaryColorDark text-2xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p
            className="font-semibold text-[14px] truncate"
            title={document.name}
          >
            {document.name}
          </p>

          <p className="text-[12px] text-textGreyColor capitalize">
            {document.type ?? "Document"}
          </p>
        </div>
        {!document.isForm ? (
          <button
            type="button"
            onClick={() =>
              window.open(document.url, "_blank", "noopener,noreferrer")
            }
            className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-primaryColorDark text-primaryColorDark hover:bg-primaryColorDark/5 transition-colors cursor-pointer shrink-0"
          >
            <FiExternalLink />
            View document
          </button>
        ) : (
          showDeleteWarning && (
            <button
              type="button"
              disabled={deleteSubmissionsMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete all previous submissions for this form? This action cannot be undone.",
                  )
                ) {
                  deleteSubmissionsMutation.mutate();
                }
              }}
              className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-red-500 text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <FiTrash2 />
              {deleteSubmissionsMutation.isPending
                ? "Deleting..."
                : "Delete Submissions"}
            </button>
          )
        )}
      </div>

      <hr className="text-textGreyColor/30 h-0.5 mb-4" />

      {showDeleteWarning && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-[12px] text-red-700 leading-relaxed font-medium">
          Document is updated. Do you want to delete the previous submissions?
          If not, the document will not share with clients who already submit
          the form.
        </div>
      )}

      {/* Premium Filter Tabs */}
      <div className="flex gap-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
        {tabs.map((t) => {
          const isActive = filterStatus === t.value;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setFilterStatus(t.value);
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer border-0 outline-none ${
                isActive
                  ? "bg-primaryColorDark text-white shadow-sm"
                  : "text-textGreyColor hover:bg-gray-200/50"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {pagination && pagination.total > 0 && (
        <p className="text-[12px] text-textGreyColor mb-3">
          Showing {(pagination.page - 1) * pagination.limit + 1}–
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} recipient{pagination.total === 1 ? "" : "s"}
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
          {filterStatus === "signed"
            ? `No ${document.isForm ? "submissions" : "signatures"} found.`
            : filterStatus === "awaiting"
              ? "No pending recipients found."
              : `No clients have this ${document.isForm ? "form" : "document"} shared yet.`}
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

const DocumentRecipientsModal: React.FC<DocumentRecipientsModalProps> = (
  props,
) => {
  return (
    <ModalLayout
      heading={
        props.document.isForm
          ? "Form Submissions Status"
          : "Document Recipients"
      }
      modalBodyContent={<ModalBody {...props} />}
    />
  );
};

export default DocumentRecipientsModal;
