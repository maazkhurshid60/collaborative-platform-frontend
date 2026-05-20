import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import ViewIcon from "../../../components/icons/view/View";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import DownloadIcon from "../../../components/icons/download/Download";
import UserIcon from "../../../components/icons/user/User";
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  isModalShowReducser,
  isshowSignedDocumentModalClientPortalReducer,
} from "../../../redux/slices/ModalSlice";
import { toast } from "react-toastify";
import documentApiService from "../../../apiServices/documentApi/DocumentApi";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../apiServices/axiosInstance/AxiosInstance";

import * as mammoth from "mammoth";
import {
  DocModalData,
  documentSignByClientType,
  DocumentType,
} from "../../../types/documentType/DocumentType";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Loader from "../../../components/loader/Loader";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterDocuments } from "../../../utils/FilteredDocuments";
import SignedDocModal from "../../../components/modals/clientModal/viewDocModal/SignedDocModal";

const heading = ["document", "type", "status", "date", "Shared by", "action"];

const Document = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [previewKind, setPreviewKind] = useState<
    "html" | "pdf" | "image" | undefined
  >(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [dataSendToSignedDocModal, setDataSendToSignedDocModal] = useState<
    DocumentType | undefined
  >(undefined);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const isshowSignedDocumentModal = useSelector(
    (state: RootState) => state.modalSlice.isshowSignedDocumentModal,
  );
  const dispatch = useDispatch<AppDispatch>();
  const clientId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );

  const { data: documentData, isLoading: isDocLoading } = useQuery<
    DocumentType[]
  >({
    queryKey: ["documents"],
    queryFn: async () => {
      const response =
        await documentApiService.getAllSharedDocumentWithClientApi(clientId);
      return response?.data?.data || [];
    },
    retry: 1,
    refetchOnWindowFocus: true, // Auto-refresh when client returns to the tab
  });

  const { data: formsData = [] } = useQuery({
    queryKey: ["shared-forms", clientId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/form/client/${clientId}`);
      return response.data.data.shares || [];
    },
    enabled: Boolean(clientId),
    retry: 1,
    refetchOnWindowFocus: true, // Auto-refresh when client returns to the tab
  });

  const combinedDocuments = useMemo(() => {
    const docs = Array.isArray(documentData)
      ? documentData.map((d) => ({ ...d, isForm: false }))
      : [];
    const frms = Array.isArray(formsData)
      ? formsData.map((f: any) => ({
          ...f,
          isForm: true,
          document: {
            name: f.template?.title || "Form Template",
            type: "Form Template",
            url: f.submission?.pdfUrl || "",
          },
          isAgree: f.status === "SUBMITTED", // "SUBMITTED" is the locked status set by the backend
          createdAt: f.createdAt,
          token: f.token,
        }))
      : [];
    return [...docs, ...frms];
  }, [documentData, formsData]);

  const filteredDocuments = filterDocuments(
    combinedDocuments || ([] as any),
    searchTerm,
  );

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: Array.isArray(filteredDocuments) ? filteredDocuments : [],
      recordPerPage: 7,
    });

  const handleDownload = async (fileUrl: string, fileName: string, docId: string) => {
    if (downloadingId) return;
    setDownloadingId(docId);
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
      console.error("Direct download failed, falling back to opening in a new tab:", err);
      window.open(fileUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const [dataSendToViewDocModal, setDataSendToViewDocModal] =
    useState<DocModalData>({
      clientId: "",
      providerId: "",
      documentId: "",
      sharedDocumentId: "",
      eSignature: "",
      isAgree: false,
      recipientId: "",
    });

  useEffect(() => {
    if (!showModal) {
      setSelectedDoc("");
      setPreviewKind(undefined);
      setPdfUrl(undefined);
      setDataSendToViewDocModal({
        clientId: "",
        providerId: "",
        documentId: "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
        recipientId: "",
      });
    }
  }, [showModal]);

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
    <OutletLayout heading="Documents">
      {isDocLoading && <Loader text="Loading Document..." />}

      {isshowSignedDocumentModal && (
        <SignedDocModal
          completedDoc={dataSendToSignedDocModal}
          clientId={clientId}
          showDownloadButton
        />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDoc}
          data={dataSendToViewDocModal as documentSignByClientType}
          previewKind={previewKind as any}
          pdfUrl={pdfUrl}
        />
      )}
      <div className="flex items-center justify-end mt-4">
        <div className="w-[40%] ">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name"
          />{" "}
        </div>
      </div>

      <div className="mt-10 w-full">
        {getCurrentRecords()?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {getCurrentRecords()?.map((data: any, id: number) => (
                <tr
                  key={id}
                  className={`border-b border-b-solid border-b-lightGreyColor pb-4`}
                >
                  <td className="px-2 py-2 font-semibold">
                    {data?.document?.name}
                  </td>
                  <td className="px-2 py-2">
                    {data?.document?.type
                      ? data?.document?.type
                      : "Questionnaire"}
                  </td>
                  <td className="px-2 py-2 ">
                    <p
                      className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm 
    ${data.isAgree ? "bg-primaryColorDark/20" : "bg-inputBgColor"}`}
                    >
                      <span>
                        <GoDotFill
                          className={`text-base ${data.isAgree ? "text-primaryColorDark" : "text-textColor"}`}
                        />
                      </span>
                      {data.isAgree ? "Completed" : "Pending"}
                    </p>
                  </td>
                  <td className="px-2 py-2">{data.createdAt.split("T")[0]}</td>
                  <td className="px-2 py-2 m-auto">
                    <div className="flex items-start gap-x-4">
                      {/* <UserIcon /> */}
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
                        <p className="lowercase">
                          {" "}
                          {data?.provider?.user?.email}
                        </p>
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
                            } else {
                              window.open(
                                `/public/forms/${data.token}`,
                                "_blank",
                              );
                            }
                          } else {
                            callFun(data);
                          }
                        }}
                      />

                      {((!data.isForm && !data.isAgree) || (data.isForm && data.isAgree)) && (
                        downloadingId === data.id ? (
                          <div className="flex items-center justify-center w-[16px] h-[16px]">
                            <div className="w-4 h-4 rounded-full border-2 border-primaryColorDark border-t-transparent animate-spin" />
                          </div>
                        ) : (
                          <div className={downloadingId ? "opacity-35 pointer-events-none" : ""}>
                            <DownloadIcon
                              onClick={() => {
                                if (downloadingId) return;
                                handleDownload(
                                  data?.document?.url ?? "",
                                  data?.document?.name ?? "",
                                  data.id,
                                );
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

export default Document;
