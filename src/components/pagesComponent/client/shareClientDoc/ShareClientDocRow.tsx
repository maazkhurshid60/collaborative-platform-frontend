import React from "react";
import { useDispatch } from "react-redux";
import { IoDocumentTextOutline } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { Eye } from "lucide-react";
import { toast } from "react-toastify";

import Checkbox from "@/components/checkbox/Checkbox";
import ViewIcon from "@/components/icons/view/View";
import { AppDispatch } from "@/redux/store";
import {
  isModalShowReducser,
  isClientCompleteDocModalReducer,
} from "@/redux/slices/ModalSlice";
import { generateFormPdfUrl } from "@/pdf/utils/pdfHelpers";

interface ShareClientDocRowProps {
  doc: any;
  serialNo: number;
  isSelected: boolean;
  status: "COMPLETED" | "PENDING" | "NOT_SHARED";
  toggleSelectDoc: (id: string, checked: boolean) => void;
  clientId: string;
  providerId: string | undefined;
  recipientId: string | undefined;
  setModalData: React.Dispatch<
    React.SetStateAction<{
      docForRecipients: any | null;
      selectedDocHtml: string;
      dataSendToViewDocModal: any;
    }>
  >;
  setActiveModal: React.Dispatch<
    React.SetStateAction<"CONFIRM_SHARE" | "FILL_FORMS" | "VIEW" | null>
  >;
  setSelectedCompletedDoc: React.Dispatch<React.SetStateAction<any | undefined>>;
}

export const ShareClientDocRow: React.FC<ShareClientDocRowProps> = ({
  doc,
  serialNo,
  isSelected,
  status,
  toggleSelectDoc,
  clientId,
  providerId,
  recipientId,
  setModalData,
  setActiveModal,
  setSelectedCompletedDoc,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleViewDocument = async (doc: any) => {
    try {
      if (doc.isForm) {
        const formDoc = { ...doc, isForm: true, name: doc.name };
        const url = await generateFormPdfUrl(formDoc);

        setModalData({
          docForRecipients: formDoc,
          selectedDocHtml: "",
          dataSendToViewDocModal: {
            clientId,
            providerId: providerId || "",
            documentId: doc.id,
            recipientId: "",
            sharedDocumentId: "",
            eSignature: "",
            isAgree: false,
            pdfUrl: url,
          },
        });
        setActiveModal("VIEW");
        dispatch(isModalShowReducser(true));
      } else {
        setModalData({
          docForRecipients: doc,
          selectedDocHtml: "",
          dataSendToViewDocModal: {
            clientId,
            providerId: providerId || "",
            documentId: doc.id,
            recipientId: recipientId || "",
            sharedDocumentId: "",
            eSignature: "",
            isAgree: false,
            pdfUrl: doc.url,
          },
        });
        setActiveModal("VIEW");
        dispatch(isModalShowReducser(true));
      }
    } catch (error) {
      console.error("Error displaying template:", error);
      toast.error("Failed to display document template.");
    }
  };

  const handleViewSubmittedForm = async (doc: any) => {
    try {
      const share = doc.shares?.find(
        (s: any) => s.clientId === clientId && s.providerId === providerId,
      );
      const submissionData = share?.submission?.data || {};
      const signature = share?.submission?.signature || null;
      const formDoc = { ...doc, isForm: true, name: doc.name };
      const url = await generateFormPdfUrl(formDoc, submissionData, signature);

      setModalData({
        docForRecipients: formDoc,
        selectedDocHtml: "",
        dataSendToViewDocModal: {
          clientId,
          providerId: providerId || "",
          documentId: doc.id,
          recipientId: "",
          sharedDocumentId: "",
          eSignature: signature || "",
          isAgree: true,
          pdfUrl: url,
        },
      });
      setActiveModal("VIEW");
      dispatch(isModalShowReducser(true));
    } catch (error) {
      console.error("Error displaying submitted form:", error);
      toast.error("Failed to display form submission.");
    }
  };

  const handleViewSignedMasterDoc = (doc: any) => {
    const share = doc.sharedWith?.find(
      (sw: any) => sw.clientId === clientId && sw.providerId === providerId,
    );
    setSelectedCompletedDoc({
      ...doc,
      id: share?.id || doc.id,
      documentId: doc.id,
    });
    dispatch(isClientCompleteDocModalReducer(true));
  };

  return (
    <tr className="border-b border-b-solid border-b-lightGreyColor">
      {/* Checkbox */}
      <td className="px-4 py-3 align-middle w-11">
        <Checkbox
          checked={isSelected}
          onChange={(e) => toggleSelectDoc(doc.id, e.target.checked)}
        />
      </td>

      {/* Serial No */}
      <td className="px-4 py-3 align-middle w-10 whitespace-nowrap text-sm text-gray-500">
        {serialNo}
      </td>

      {/* Document Info */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-x-3 min-w-0">
          <IoDocumentTextOutline className="text-primaryColorDark text-2xl shrink-0" />
          <span
            className="block truncate font-medium text-[14px] max-w-50 md:max-w-87.5"
            title={doc.name}
          >
            {doc.name}
          </span>
        </div>
      </td>

      {/* Document Type */}
      <td className="px-4 py-3 align-middle whitespace-nowrap capitalize text-sm">
        {doc.type ?? "-"}
      </td>

      {/* Document Status */}
      <td className="px-4 py-3 align-middle whitespace-nowrap text-sm">
        <div className="flex items-center gap-x-2">
          {(() => {
            if (status === "COMPLETED") {
              return (
                <button
                  type="button"
                  onClick={() =>
                    doc.isForm
                      ? handleViewSubmittedForm(doc)
                      : handleViewSignedMasterDoc(doc)
                  }
                  title="Click to view signed/submitted document"
                  className="inline-flex items-center gap-x-2 rounded-md px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition duration-150 cursor-pointer outline-none"
                >
                  <GoDotFill className="text-green-500 text-xs" />
                  {doc.isForm ? "Submitted" : "Signed"}
                </button>
              );
            }
            if (status === "PENDING") {
              return (
                <span className="inline-flex items-center gap-x-2 rounded-md px-3 py-1 text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <GoDotFill className="text-yellow-500 text-xs" />
                  {doc.isForm ? "Awaiting submission" : "Awaiting signature"}
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-x-2 rounded-md px-3 py-1 text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                <GoDotFill className="text-gray-400 text-xs" />
                Not Shared
              </span>
            );
          })()}

          {(() => {
            const count = doc.isForm
              ? doc.shares?.filter(
                  (s: any) => s.clientId === clientId && s.providerId === providerId,
                )?.length || 0
              : doc.sharedWith?.filter(
                  (sw: any) => sw.clientId === clientId && sw.providerId === providerId,
                )?.length || 0;

            if (count > 0) {
              return (
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold bg-primaryColorDark/10 text-primaryColorDark border border-primaryColorDark/20">
                  Shared {count} {count === 1 ? "time" : "times"}
                </span>
              );
            }
            return null;
          })()}
        </div>
      </td>

      {/* Date Created */}
      <td className="px-4 py-3 align-middle whitespace-nowrap text-textGreyColor text-[13px]">
        {new Date(doc.createdAt).toLocaleDateString()}
      </td>

      {/* Action Column */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex items-center justify-start gap-x-2">
          {/* View template details */}
          <div
            className="w-5 h-5 flex items-center justify-center cursor-pointer"
            title="Preview Template"
          >
            <ViewIcon onClick={() => handleViewDocument(doc)} />
          </div>

          {/* Direct link shortcut if it is signed/submitted */}
          {status === "COMPLETED" && (
            <button
              type="button"
              onClick={() =>
                doc.isForm
                  ? handleViewSubmittedForm(doc)
                  : handleViewSignedMasterDoc(doc)
              }
              title="View Completed/Signed Document"
              className="text-primaryColorDark hover:opacity-80 transition duration-150 cursor-pointer p-0 bg-transparent border-0 outline-none flex items-center justify-center"
            >
              <Eye size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
