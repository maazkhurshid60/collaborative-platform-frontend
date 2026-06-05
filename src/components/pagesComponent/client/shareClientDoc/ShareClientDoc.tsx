import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaRegShareFromSquare } from "react-icons/fa6";

import Button from "../../../button/Button";
import ClientFormShareModal from "../../../modals/providerModal/clientDocShareModal/ClientFormShareModal";
import { AppDispatch, RootState } from "../../../../redux/store";
import { isModalShowReducser } from "../../../../redux/slices/ModalSlice";
import Checkbox from "../../../checkbox/Checkbox";
import axiosInstance from "../../../../apiServices/axiosInstance/AxiosInstance";
import ClientCompleteDocShareModal from "../../../modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal";
import ViewDocModal from "../../../modals/clientModal/viewDocModal/ViewDocModal";
import { generateFormPdfUrl } from "../../../../pdf/utils/pdfHelpers";
import { documentSignByClientType } from "../../../../types/documentType/DocumentType";
import NoRecordFound from "../../../noRecordFound/NoRecordFound";
import Loader from "../../../loader/Loader";

interface ShareClientDocProps {
  clientId: string;
  recipientId?: string;
  clientEmail?: string;
}

const ShareClientDoc: React.FC<ShareClientDocProps> = ({
  clientId,
  recipientId,
  clientEmail,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [sharedDocs, setSharedDocs] = useState<string[]>();
  const [sharedDocsId, setSharedDocsId] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<"SHARE" | "VIEW" | null>(null);
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

  const isShowModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const isClientCompleteDocModal = useSelector(
    (state: RootState) => state.modalSlice.isClientCompleteDocModal,
  );
  const isClientShareDocModal = useSelector(
    (state: RootState) => state.modalSlice.isClientShareDocModal,
  );
  const providerId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );
  const [selectedCompletedDoc, setSelectedCompletedDoc] = useState<
    any | undefined
  >(undefined);

  const selectDoc = (docName: string, isChecked: boolean, id: string) => {
    if (isChecked) {
      setSharedDocs((prev) => [...(prev ?? []), docName]);
      setSharedDocsId((prev) => [...(prev ?? []), id]);
    } else {
      setSharedDocs((prev) => (prev ?? []).filter((doc) => doc !== docName));
      setSharedDocsId((prev) => (prev ?? []).filter((item) => item !== id));
    }
  };

  const handleViewForm = async (doc: any) => {
    try {
      const formDoc = { ...doc, isForm: true, name: doc.title };
      const url = await generateFormPdfUrl(formDoc);

      setModalData({
        docForRecipients: formDoc,
        selectedDocHtml: "",
        dataSendToViewDocModal: {
          clientId: clientId,
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
    } catch (error) {
      console.error("Error in handleViewForm:", error);
      toast.error("Unable to view form.");
    }
  };

  const handleViewSubmittedForm = async (doc: any) => {
    try {
      const submissionData = doc?.submission?.data || {};
      const signature = doc?.submission?.signature || null;
      const formDoc = { ...doc, isForm: true, name: doc.title };
      const url = await generateFormPdfUrl(formDoc, submissionData, signature);

      setModalData({
        docForRecipients: formDoc,
        selectedDocHtml: "",
        dataSendToViewDocModal: {
          clientId: clientId,
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

  const { data: documentData, isLoading } = useQuery<any>({
    queryKey: ["formTemplates", clientId],
    queryFn: async () => {
      try {
        const [templatesRes, sharesRes] = await Promise.all([
          axiosInstance.get("/form/templates"),
          axiosInstance.get("/form/client/" + clientId),
        ]);

        const templates = templatesRes.data?.data?.templates || [];
        const shares = sharesRes.data?.data?.shares || [];

        const uncompleted: any[] = [];
        const shared: any[] = [];
        const completed: any[] = [];

        templates.forEach((template: any) => {
          const share = shares.find((s: any) => s.templateId === template.id);
          if (!share) {
            uncompleted.push(template);
          } else if (share.status === "PENDING") {
            shared.push({ ...template, shareId: share.id });
          } else if (share.status === "SUBMITTED") {
            completed.push({
              ...template,
              shareId: share.id,
              submission: share.submission,
            });
          }
        });

        return {
          uncompletedDocuments: uncompleted,
          sharedDocuments: shared,
          completedDocuments: completed,
        };
      } catch (error) {
        console.error("Error fetching form templates:", error);
        return {
          uncompletedDocuments: [],
          sharedDocuments: [],
          completedDocuments: [],
        };
      }
    },
  });

  return (
    <div>
      {isLoading && <Loader />}
      {isShowModal && activeModal === "SHARE" && recipientId && (
        <ClientFormShareModal
          sharedDocs={sharedDocs}
          clientId={clientId}
          providerId={providerId}
          sharedDocsId={sharedDocsId}
          clientEmail={clientEmail}
        />
      )}
      {isClientCompleteDocModal && (
        <ClientCompleteDocShareModal
          showDownloadButton
          completedDoc={selectedCompletedDoc}
          clientId={clientId}
        />
      )}
      {isShowModal && activeModal === "VIEW" && (
        <ViewDocModal
          sharedDocs={modalData.selectedDocHtml}
          isOnlyRead
          data={modalData.dataSendToViewDocModal as documentSignByClientType}
          previewKind="pdf"
          pdfUrl={modalData.dataSendToViewDocModal?.pdfUrl}
          heading={modalData.docForRecipients?.name || "Form Template"}
        />
      )}
      <div className="relative pl-2">
        <div className="mt-8 flex items-center justify-between mb-2">
          <p className="font-semibold text-[14px] ">Needs to be Shared</p>
          <div className="w-23.75">
            <Button
              text="Share"
              sm
              onclick={() => {
                if (sharedDocs && sharedDocs.length > 0) {
                  setActiveModal("SHARE");
                  dispatch(isModalShowReducser(true));
                } else {
                  toast.warn("Select a document first");
                }
              }}
              icon={<FaRegShareFromSquare />}
            />
          </div>
        </div>
        <div className="grid  grid-cols-1 sm:grid-cols-2 gap-y-3">
          {documentData?.uncompletedDocuments?.map((data: any) => (
            <div
              key={data.id}
              className="flex items-center gap-x-3 font-medium text-[14px]"
            >
              <Checkbox
                onChange={(e) =>
                  selectDoc(data.title, e.target.checked, data.id)
                }
                checked={sharedDocs?.includes(data.title) ?? false}
              />
              <div
                className="cursor-pointer flex items-center gap-x-2"
                onClick={() => handleViewForm(data)}
              >
                <IoDocumentTextOutline className="text-primaryColorDark text-2xl" />
                {data?.title}
              </div>
            </div>
          ))}
        </div>

        <hr className="text-textGreyColor/30 h-0.5 mt-10 mb-10" />

        <div className="mt-8 flex items-center justify-between mb-2">
          <p className="font-semibold text-[14px] ">
            Shared Documents for client review
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
          {documentData?.sharedDocuments &&
          documentData?.sharedDocuments?.length > 0 ? (
            documentData?.sharedDocuments?.map((data: any) => (
              <div
                key={data.id}
                className="cursor-pointer flex items-center gap-x-3 font-medium text-[14px] "
                onClick={() => handleViewForm(data)}
              >
                <IoDocumentTextOutline className="text-primaryColorDark text-2xl" />
                {data?.title}
              </div>
            ))
          ) : (
            <NoRecordFound />
          )}
        </div>

        <hr className="text-textGreyColor/30 h-0.5 mt-10 mb-10" />

        <div className="mt-8 flex items-center justify-between mb-2">
          <p className="font-semibold text-[14px] ">Completed Documents</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
          {documentData?.completedDocuments &&
          documentData?.completedDocuments?.length > 0 ? (
            documentData?.completedDocuments?.map((data: any) => (
              <div
                key={data.id}
                className="cursor-pointer flex items-center gap-x-3 font-medium text-[14px] "
                onClick={() => handleViewSubmittedForm(data)}
              >
                <IoDocumentTextOutline className="text-primaryColorDark text-2xl" />
                {data?.title}
              </div>
            ))
          ) : (
            <NoRecordFound />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareClientDoc;
