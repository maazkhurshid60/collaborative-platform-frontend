import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { GoDotFill } from "react-icons/go";
import { toast } from "react-toastify";
import * as mammoth from "mammoth";

import ViewIcon from "../../../components/icons/view/View";
import DownloadIcon from "../../../components/icons/download/Download";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import UserIcon from "../../../components/icons/user/User";
import { AppDispatch } from "../../../redux/store";
import {
  isModalShowReducser,
  isshowSignedDocumentModalClientPortalReducer,
} from "../../../redux/slices/ModalSlice";
import {
  DocumentType,
  DocModalData,
} from "../../../types/documentType/DocumentType";

interface DocumentRowProps {
  data: any;
  index: number;
  onDeleteClick: (id: string, name: string) => void;
  setSelectedDoc: (doc: string) => void;
  setPreviewKind: (kind: "html" | "pdf" | "image" | undefined) => void;
  setPdfUrl: (url: string | undefined) => void;
  setDataSendToViewDocModal: (data: DocModalData) => void;
  setDataSendToSignedDocModal: (data: DocumentType) => void;
}

/** Returns true when a form share is past its expiry and was never submitted. */
export const isExpiredFormShare = (data: any): boolean =>
  data.isForm &&
  !data.isAgree &&
  Boolean(data.expiresAt) &&
  new Date() > new Date(data.expiresAt);

export const DocumentRow: React.FC<DocumentRowProps> = ({
  data,
  onDeleteClick,
  setSelectedDoc,
  setPreviewKind,
  setPdfUrl,
  setDataSendToViewDocModal,
  setDataSendToSignedDocModal,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl, {
        credentials: "include",
      });
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
      console.error(
        "Direct download failed, falling back to opening in a new tab:",
        err,
      );
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const callFun = async (value: DocumentType) => {
    if (value.isAgree) {
      setDataSendToSignedDocModal(value);
      dispatch(isshowSignedDocumentModalClientPortalReducer(true));
      return;
    } else {
      try {
        const fileUrl =
          value?.document?.url &&
          value?.document?.url.startsWith("http") &&
          value?.document?.url;

        if (fileUrl) {
          const extension = fileUrl.split(".").pop()?.toLowerCase();

          setDataSendToViewDocModal({
            clientId: value?.clientId,
            providerId: value?.providerId,
            documentId: value?.id,
            recipientId: value?.provider?.userId,
          });

          if (extension === "pdf") {
            setPdfUrl(fileUrl);
            setPreviewKind("pdf");
            dispatch(isModalShowReducser(true));
          } else if (
            ["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "")
          ) {
            setPdfUrl(fileUrl);
            setPreviewKind("image");
            dispatch(isModalShowReducser(true));
          } else if (["docx", "doc"].includes(extension || "")) {
            const response = await fetch(fileUrl, { credentials: "include" });
            if (!response.ok) throw new Error("File not found");
            const arrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setSelectedDoc(result.value);
            setPreviewKind("html");
            dispatch(isModalShowReducser(true));
          } else {
            // Fallback to Google Viewer via PDF viewer for other types
            setPdfUrl(fileUrl);
            setPreviewKind("pdf");
            dispatch(isModalShowReducser(true));
          }
        }
      } catch (err) {
        toast.error("Unable to preview document.");
        console.error(err);
      }
    }
  };

  return (
    <tr className="border-b border-b-solid border-b-lightGreyColor pb-4">
      <td className="px-2 py-2 font-semibold">{data?.document?.name}</td>
      <td className="px-2 py-2">
        {data?.document?.type ? data?.document?.type : "Questionnaire"}
      </td>
      <td className="px-2 py-2">
        {(() => {
          if (data.isAgree) {
            return (
              <p className="inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm bg-primaryColorDark/20">
                <span>
                  <GoDotFill className="text-base text-primaryColorDark" />
                </span>
                Completed
              </p>
            );
          }
          if (isExpiredFormShare(data)) {
            return (
              <p className="inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm bg-red-100">
                <span>
                  <GoDotFill className="text-base text-red-500" />
                </span>
                Expired
              </p>
            );
          }
          return (
            <p className="inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm bg-inputBgColor">
              <span>
                <GoDotFill className="text-base text-textColor" />
              </span>
              Pending
            </p>
          );
        })()}
      </td>
      <td className="px-2 py-2">{data.createdAt.split("T")[0]}</td>
      <td className="px-2 py-2 m-auto">
        <div className="flex items-start gap-x-4">
          {data?.provider?.user?.profileImage !== null &&
          data?.provider?.user?.profileImage !== "null" ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={
                data?.provider?.user?.profileImage
                  ? data?.provider?.user?.profileImage
                  : undefined
              }
              alt="Provider Profile"
            />
          ) : (
            <UserIcon size={30} />
          )}
          <div className="text-left">
            <p>{data?.provider?.user?.fullName}</p>
            <p className="lowercase"> {data?.provider?.user?.email}</p>
          </div>
        </div>
      </td>

      <td className="py-2 h-full align-middle">
        <div className="flex items-center justify-center gap-x-2 h-full">
          <ViewIcon
            onClick={() => {
              if (data.isForm) {
                if (data.isAgree) {
                  callFun(data);
                } else if (!isExpiredFormShare(data)) {
                  window.open(`/public/forms/${data.token}`, "_blank");
                }
              } else {
                callFun(data);
              }
            }}
          />

          {((!data.isForm && !data.isAgree) || (data.isForm && data.isAgree)) &&
            (isDownloading ? (
              <div className="flex items-center justify-center w-4 h-4">
                <div className="w-4 h-4 rounded-full border-2 border-primaryColorDark border-t-transparent animate-spin" />
              </div>
            ) : (
              <div>
                <DownloadIcon
                  onClick={() =>
                    handleDownload(
                      data?.document?.url ?? "",
                      data?.document?.name ?? "",
                    )
                  }
                />
              </div>
            ))}

          {/* Delete icon for expired form shares — opens proper confirm modal */}
          {isExpiredFormShare(data) && (
            <DeleteIcon
              onClick={() =>
                onDeleteClick(data.id, data.document?.name || "this document")
              }
            />
          )}
        </div>
      </td>
    </tr>
  );
};
