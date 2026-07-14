import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { AppDispatch, RootState } from "../redux/store";
import {
  isDocumentRecipientsModalReducer,
  isClientCompleteDocModalReducer,
  isModalShowReducser,
} from "../redux/slices/ModalSlice";
import { MasterDocument } from "../types/documentType/DocumentType";
import { generateFormPdfUrl } from "../pdf/utils/pdfHelpers";

export const useDocumentModals = (
  providerId: string | undefined,
  combinedDocs: MasterDocument[],
) => {
  const dispatch = useDispatch<AppDispatch>();

  const isMultiClientDocShareModal = useSelector(
    (state: RootState) => state.modalSlice.isMultiClientDocShareModal,
  );
  const isDocumentRecipientsModal = useSelector(
    (state: RootState) => state.modalSlice.isDocumentRecipientsModal,
  );
  const isClientCompleteDocModal = useSelector(
    (state: RootState) => state.modalSlice.isClientCompleteDocModal,
  );
  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );

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

  const activeDocForModal = useMemo(() => {
    if (!modalData.docForRecipients) return null;
    return (
      combinedDocs.find((d) => d.id === modalData.docForRecipients?.id) ||
      modalData.docForRecipients
    );
  }, [combinedDocs, modalData.docForRecipients]);

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

  return {
    isMultiClientDocShareModal,
    isDocumentRecipientsModal,
    isClientCompleteDocModal,
    showModal,
    modalData,
    activeDocForModal,
    handleViewDocument,
    handleViewRecipients,
    handleViewSigned,
  };
};
