import React from "react";

import MultiClientDocShareModal from "../../../../components/modals/providerModal/multiClientDocShareModal/MultiClientDocShareModal";
import DocumentRecipientsModal from "../../../../components/modals/providerModal/documentRecipientsModal/DocumentRecipientsModal";
import ClientCompleteDocShareModal from "../../../../components/modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal";
import ViewDocModal from "../../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import {
  MasterDocument,
  documentSignByClientType,
} from "../../../../types/documentType/DocumentType";
import { ClientType } from "../../../../types/clientType/ClientType";

interface DocumentSharingModalsProps {
  isMultiClientDocShareModal: boolean;
  isDocumentRecipientsModal: boolean;
  isClientCompleteDocModal: boolean;
  showModal: boolean;
  modalData: {
    docForRecipients: MasterDocument | null;
    recipientsFilterStatus?: "signed" | "awaiting";
    signedViewClientId: string | null;
    selectedDocHtml: string;
    dataSendToViewDocModal: any;
  };
  activeDocForModal: MasterDocument | null;
  myClients: ClientType[];
  providerId: string | undefined;
  loginUserId: string | undefined;
  selectedDocs: MasterDocument[];
  handleViewSigned: (clientId: string, submission?: any) => void;
  onShared: () => void;
}

export const DocumentSharingModals: React.FC<DocumentSharingModalsProps> = ({
  isMultiClientDocShareModal,
  isDocumentRecipientsModal,
  isClientCompleteDocModal,
  showModal,
  modalData,
  activeDocForModal,
  myClients,
  providerId,
  loginUserId,
  selectedDocs,
  handleViewSigned,
  onShared,
}) => {
  return (
    <>
      {isMultiClientDocShareModal && (
        <MultiClientDocShareModal
          selectedDocs={selectedDocs}
          clients={myClients}
          providerId={providerId || ""}
          senderId={loginUserId || ""}
          onShared={onShared}
        />
      )}

      {isDocumentRecipientsModal && activeDocForModal && providerId && (
        <DocumentRecipientsModal
          document={activeDocForModal}
          providerId={providerId}
          onViewSigned={handleViewSigned}
          initialStatus={modalData.recipientsFilterStatus}
        />
      )}

      {isClientCompleteDocModal &&
        activeDocForModal &&
        modalData.signedViewClientId && (
          <ClientCompleteDocShareModal
            showDownloadButton
            completedDoc={activeDocForModal as any}
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
    </>
  );
};
