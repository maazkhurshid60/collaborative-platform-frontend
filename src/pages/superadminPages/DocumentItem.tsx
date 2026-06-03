import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as mammoth from "mammoth";
import ViewIcon from "../../components/icons/view/View";
import DeleteIcon from "../../components/icons/delete/DeleteIcon";
import EditIcon from "../../components/icons/edit/Edit";
import { generateFormPdfUrl } from "../../pdf/utils/pdfHelpers";

type PreviewType = "image" | "pdf" | "docx" | "unsupported";
export type PreviewKind = "html" | "pdf";

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

interface DocumentItemProps {
  doc: any;
  onShowPreview: (docHtml: string, pdfUrl: string, kind: PreviewKind, dataModal: any) => void;
  onDelete: (id: string, isForm: boolean) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  doc,
  onShowPreview,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handlePreview = async (doc: any) => {
    try {
      const fileUrl = typeof doc?.url === "string" ? doc.url : "";
      if (!fileUrl) {
        toast.error("Document URL not found.");
        return;
      }

      const modalData = {
        clientId: doc?.clientId || "",
        providerId: doc?.providerId || "",
        documentId: doc?.id || "",
        recipientId: doc?.provider?.userId || "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
      };

      const type = await detectPreviewType(fileUrl);

      if (type === "image") {
        onShowPreview(
          `
          <div style="display:flex;justify-content:center;align-items:center;width:100%;">
            <img src="${fileUrl}" alt="Document preview"
              crossorigin="use-credentials"
              style="max-width:100%;height:auto;border-radius:8px;" />
          </div>
        `,
          "",
          "html",
          modalData
        );
        return;
      }

      if (type === "pdf") {
        onShowPreview("", fileUrl, "pdf", modalData);
        return;
      }

      if (type === "docx") {
        const res = await fetch(fileUrl, {
          credentials: "include",
        });
        if (!res.ok)
          throw new Error(`Unable to fetch document (HTTP ${res.status}).`);

        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        onShowPreview(
          result.value || "<p>Unable to render document.</p>",
          "",
          "html",
          modalData
        );
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
      onShowPreview("", url, "pdf", {
        clientId: "",
        providerId: "",
        documentId: doc.id,
        recipientId: "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
      });
    } catch (error) {
      toast.error("Unable to view form.");
    }
  };

  return (
    <tr className="border-b border-b-solid border-b-lightGreyColor pb-4">
      <td className="px-4 py-3 font-semibold">{doc?.name || "-"}</td>
      <td className="px-4 py-3">{doc?.type || "Questionnaire"}</td>
      <td className="px-4 py-3">
        {(doc?.createdAt || "").split("T")[0] || "-"}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-x-2">
          {!doc.isForm ? (
            <>
              <ViewIcon onClick={() => handlePreview(doc)} />
              <DeleteIcon onClick={() => onDelete(doc?.id, false)} />
            </>
          ) : (
            <>
              <ViewIcon onClick={() => handleViewForm(doc)} />
              <EditIcon onClick={() => navigate(`/edit-template/${doc.id}`)} />
              <DeleteIcon onClick={() => onDelete(doc?.id, true)} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DocumentItem;
