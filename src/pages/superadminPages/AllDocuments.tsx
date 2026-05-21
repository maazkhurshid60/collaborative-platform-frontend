import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../apiServices/axiosInstance/AxiosInstance";
import { toast } from "react-toastify";
import * as mammoth from "mammoth";

import { AppDispatch, RootState } from "../../redux/store";
import documentApiService from "../../apiServices/documentApi/DocumentApi";
import usePaginationHook from "../../hook/usePaginationHook";
import {
  DocModalData,
  documentSignByClientType,
} from "../../types/documentType/DocumentType";

import OutletLayout from "../../layouts/outletLayout/OutletLayout";
import Loader from "../../components/loader/Loader";
import ViewDocModal from "../../components/modals/clientModal/viewDocModal/ViewDocModal";
import NoRecordFound from "../../components/noRecordFound/NoRecordFound";
import Table from "../../components/table/Table";
import ViewIcon from "../../components/icons/view/View";
import DeleteIcon from "../../components/icons/delete/DeleteIcon";
import CustomPagination from "../../components/customPagination/CustomPagination";
import Button from "../../components/button/Button";
import SearchBar from "../../components/searchBar/SearchBar";

import {
  isModalDeleteReducer,
  isModalShowReducser,
} from "../../redux/slices/ModalSlice";

import { IoMdAdd } from "react-icons/io";
import ViewAddDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/ViewAddDocumentModal";
import DeleteDocumentModal from "../../components/modals/superAdminModal/deleteAccountModal/deleteDocumentModal/DeleteDocumentModal";

import { useDebounce } from "../../hook/useDebounce";
import { filterDocuments } from "../../utils/FilteredDocuments";
import { generateFormPdfUrl } from "../../pdf/utils/pdfHelpers";

type PreviewType = "image" | "pdf" | "docx" | "unsupported";
type PreviewKind = "html" | "pdf";

function stripQueryAndHash(url: string) {
  return url.split("#")[0].split("?")[0];
}

function getExt(url: string) {
  const clean = stripQueryAndHash(url);
  const parts = clean.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() || "").toLowerCase();
}

function previewTypeByExt(url: string): PreviewType {
  const ext = getExt(url);

  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext))
    return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";

  return "unsupported";
}

async function previewTypeByHead(url: string): Promise<PreviewType> {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      credentials: "include",
    });
    const ct = (head.headers.get("content-type") || "").toLowerCase();

    if (ct.startsWith("image/")) return "image";
    if (ct.includes("pdf")) return "pdf";
    if (ct.includes("officedocument") || ct.includes("msword")) return "docx";
  } catch {
    // ignore
  }
  return "unsupported";
}

async function detectPreviewType(url: string): Promise<PreviewType> {
  const extType = previewTypeByExt(url);
  if (extType !== "unsupported") return extType;
  return await previewTypeByHead(url);
}

const AllDocuments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const heading = ["document", "type", "date", "action"];

  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const deleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );
  const showAddDocumentModal = useSelector(
    (state: RootState) => state.modalSlice.isAddDocumentModalShow,
  );

  const clientId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // NEW: preview mode state
  const [previewKind, setPreviewKind] = useState<PreviewKind>("html");
  const [selectedDocHtml, setSelectedDocHtml] = useState<string>("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>("");

  const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(
    null,
  );
  const [isFormToDelete, setIsFormToDelete] = useState(false);

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

  const {
    data: documentData = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["documents", clientId],
    enabled: Boolean(clientId),
    queryFn: async () => {
      const response = await documentApiService.getAllDocuments(clientId);

      return response?.data?.data?.allDocuments || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: formData = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/form/templates");
        return res.data.data.templates || [];
      } catch (error) {
        console.error("Error fetching forms:", error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const combinedData = useMemo(() => {
    const docs = Array.isArray(documentData)
      ? documentData.map((d: any) => ({ ...d, isForm: false }))
      : [];
    const forms = Array.isArray(formData)
      ? formData.map((f: any) => ({
          ...f,
          isForm: true,
          name: f.title, // Map title to name for display consistency
          type: "Form Template",
        }))
      : [];
    return [...docs, ...forms];
  }, [documentData, formData]);

  const filteredDocuments = useMemo(() => {
    return filterDocuments(combinedData, debouncedSearchTerm);
  }, [combinedData, debouncedSearchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: filteredDocuments,
      recordPerPage: 7,
    });

  const handlePreview = async (doc: any) => {
    try {
      const fileUrl = typeof doc?.url === "string" ? doc.url : "";
      if (!fileUrl) {
        toast.error("Document URL not found.");
        return;
      }

      setDataSendToViewDocModal({
        clientId: doc?.clientId || "",
        providerId: doc?.providerId || "",
        documentId: doc?.id || "",
        recipientId: doc?.provider?.userId || "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
      });

      const type = await detectPreviewType(fileUrl);

      if (type === "image") {
        setPreviewKind("html");
        setSelectedPdfUrl("");
        setSelectedDocHtml(`
          <div style="display:flex;justify-content:center;align-items:center;width:100%;">
            <img src="${fileUrl}" alt="Document preview"
              crossorigin="use-credentials"
              style="max-width:100%;height:auto;border-radius:8px;" />
          </div>
        `);
        dispatch(isModalShowReducser(true));
        return;
      }

      // IMPORTANT CHANGE: use react-pdf, not iframe
      if (type === "pdf") {
        setPreviewKind("pdf");
        setSelectedPdfUrl(fileUrl);
        setSelectedDocHtml("");
        dispatch(isModalShowReducser(true));
        return;
      }

      if (type === "docx") {
        setPreviewKind("html");
        setSelectedPdfUrl("");

        const res = await fetch(fileUrl, {
          credentials: "include",
        });
        if (!res.ok)
          throw new Error(`Unable to fetch document (HTTP ${res.status}).`);

        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        setSelectedDocHtml(result.value || "<p>Unable to render document.</p>");
        dispatch(isModalShowReducser(true));
        return;
      }

      toast.error("Preview not supported for this file type.");
    } catch (_err: any) {
      toast.error("Unable to preview document.");
    }
  };

  const handleViewForm = async (doc: any) => {
    try {
      const url = await generateFormPdfUrl(doc);

      setPreviewKind("pdf");
      setSelectedPdfUrl(url);
      setSelectedDocHtml("");

      setDataSendToViewDocModal({
        clientId: "",
        providerId: "",
        documentId: doc.id,
        recipientId: "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
      });

      dispatch(isModalShowReducser(true));
    } catch (error) {
      toast.error("Unable to view form.");
    }
  };

  return (
    <OutletLayout
      heading="Documents"
      button={
        <Button
          text="Add New"
          onclick={() => navigate("/create-template")}
          icon={<IoMdAdd />}
        />
      }
    >
      {(isLoading || isFetching) && <Loader text="Loading Documents..." />}

      {showAddDocumentModal && (
        <ViewAddDocumentModal
          sharedDocs={selectedDocHtml}
          isOnlyRead
          data={dataSendToViewDocModal as documentSignByClientType}
        />
      )}

      {deleteModal && documentIdToDelete && (
        <DeleteDocumentModal
          documentId={documentIdToDelete}
          isForm={isFormToDelete}
        />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDocHtml}
          isOnlyRead
          data={dataSendToViewDocModal as documentSignByClientType}
          previewKind={previewKind}
          pdfUrl={selectedPdfUrl}
        />
      )}

      <div className="flex items-center justify-end mt-4">
        <div className="w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, type, date, etc..."
          />
        </div>
      </div>

      <div className="mt-10 w-full">
        {getCurrentRecords()?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {getCurrentRecords()?.map((doc: any) => (
                <tr
                  key={doc?.id}
                  className="border-b border-b-solid border-b-lightGreyColor pb-4"
                >
                  <td className="px-4 py-3 font-semibold">
                    {doc?.name || "-"}
                  </td>
                  <td className="px-4 py-3">{doc?.type || "Questionnaire"}</td>
                  <td className="px-4 py-3">
                    {(doc?.createdAt || "").split("T")[0] || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-x-2">
                      {!doc.isForm ? (
                        <>
                          <ViewIcon onClick={() => handlePreview(doc)} />
                          <DeleteIcon
                            onClick={() => {
                              setDocumentIdToDelete(doc?.id);
                              setIsFormToDelete(false);
                              dispatch(isModalDeleteReducer(true));
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <ViewIcon onClick={() => handleViewForm(doc)} />
                          <DeleteIcon
                            onClick={() => {
                              setDocumentIdToDelete(doc?.id);
                              setIsFormToDelete(true);
                              dispatch(isModalDeleteReducer(true));
                            }}
                          />
                        </>
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

export default AllDocuments;
