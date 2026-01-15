

import React, { useMemo, useState } from "react";
import { IoDocumentText } from "react-icons/io5";
import { FaFilePdf } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { isAddDocumentModalReducer } from "../../../../redux/slices/ModalSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import LabelData from "../../../labelText/LabelData";
import Button from "../../../button/Button";
import FileUploader from "../../../uploader/fileUploader/FileUploader";
import { documentSignByClientType } from "../../../../types/documentType/DocumentType";
import documentApiService from "../../../../apiServices/documentApi/DocumentApi";
import ModalLayout from "../../modalLayout/ModalLayout";
import InputField from "../../../inputField/InputField";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

interface ViewAddDocumentModalProps {
  sharedDocs?: string;
  data: documentSignByClientType;
  isOnlyRead: boolean;
}

export const documentSchema = z.object({
  type: z.string().min(1, "Type is required"),
});

type FormFields = z.infer<typeof documentSchema>;

function formatMB(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function getFriendlyFileType(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("word")) return "Word";
  return mime || "File";
}

const ModalBodyContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [FileIconComponent, setFileIconComponent] = useState<React.ElementType | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({ resolver: zodResolver(documentSchema) });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return documentApiService.addDocumentApi(formData);
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      dispatch(isAddDocumentModalReducer(false));
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || "Something went wrong";
      toast.error(errorMessage);
      setStatusMsg(errorMessage);
    },
  });

  const helperText = useMemo(
    () => `Allowed: PDF, DOC, DOCX • Max size: ${MAX_MB}MB`,
    []
  );

  const isUploading = mutation.isPending;

  const handleFileSelect = (file: File) => {
    setStatusMsg("");

    // Validate type
    if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
      const msg = "Only PDF or Word documents are allowed.";
      toast.error(msg);
      setStatusMsg(msg);
      return;
    }

    // Validate size
    if (file.size > MAX_BYTES) {
      const msg = `File is too large. Max size is ${MAX_MB}MB.`;
      toast.error(msg);
      setStatusMsg(msg);
      return;
    }

    setSelectedFile(file);

    // Set icon
    const isPDF = file.type === "application/pdf";
    const isDOC = file.type.includes("word");

    if (isPDF) setFileIconComponent(() => FaFilePdf);
    else if (isDOC) setFileIconComponent(() => IoDocumentText);
    else setFileIconComponent(null);

    const ok = "File selected and validated.";
    toast.success(ok);
    setStatusMsg(ok);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileIconComponent(null);
    setStatusMsg("");
  };

  const submitFunction = async (data: FormFields) => {
    if (isUploading) return;

    if (!selectedFile) {
      const msg = "Please upload your document.";
      toast.error(msg);
      setStatusMsg(msg);
      return;
    }

    // Safety: re-check size/type
    if (!allowedTypes.includes(selectedFile.type as (typeof allowedTypes)[number])) {
      const msg = "Only PDF or Word documents are allowed.";
      toast.error(msg);
      setStatusMsg(msg);
      return;
    }
    if (selectedFile.size > MAX_BYTES) {
      const msg = `File is too large. Max size is ${MAX_MB}MB.`;
      toast.error(msg);
      setStatusMsg(msg);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", data.type);

    setStatusMsg("Uploading…");
    mutation.mutate(formData);
  };

  const statusColorClass = useMemo(() => {
    const s = statusMsg.toLowerCase();
    if (!statusMsg) return "";
    if (s.includes("only") || s.includes("max size") || s.includes("please upload") || s.includes("wrong")) {
      return "text-red-600";
    }
    if (s.includes("uploading")) return "text-gray-600";
    return "text-green-600";
  }, [statusMsg]);

  return (
    <form className="mt-4 flex flex-col gap-y-4" onSubmit={handleSubmit(submitFunction)}>
      <div>
        <InputField
          required
          label="Document Type"
          register={register("type")}
          placeHolder="Enter Document Type."
          error={errors.type?.message}
        />
      </div>

      <div>
        <LabelData label="Upload Document" />
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>

        {selectedFile ? (
          <div className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 relative">
            {/* TOP-RIGHT Remove button (red border/bg, black X) */}
            <button
              type="button"
              onClick={removeFile}
              disabled={isUploading}
              title="Remove file"
              aria-label="Remove selected file"
              className="absolute right-3 top-3 inline-flex items-center justify-center h-9 w-9 rounded-md border border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RxCross2 size={18} className="text-black" />
            </button>

            {/* Content row (padding-right keeps text away from button) */}
            <div className="flex items-start gap-3 pr-12">
              <div className="shrink-0 pt-0.5">
                {FileIconComponent ? (
                  <FileIconComponent className="h-10 w-10 text-red-500" />
                ) : (
                  <div className="h-10 w-10 rounded-md border flex items-center justify-center text-xs font-semibold">
                    FILE
                  </div>
                )}
              </div>

              {/* Filename area */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900" title={selectedFile.name}>
                  {selectedFile.name}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5">
                    {getFriendlyFileType(selectedFile.type)}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5">
                    {formatMB(selectedFile.size)}
                  </span>
                </div>

                {statusMsg ? (
                  <p className={["text-xs mt-3", statusColorClass].join(" ")}>
                    {statusMsg}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <FileUploader onFileSelect={handleFileSelect} />
            {statusMsg ? <p className="text-xs mt-2 text-red-600">{statusMsg}</p> : null}
          </div>
        )}
      </div>

      {/* Submit area (your Button component doesn't support disabled; we disable via wrapper) */}
      <div className={isUploading ? "opacity-60 pointer-events-none" : ""}>
        <Button text={isUploading ? "Uploading..." : "Add"} sm />
      </div>
    </form>
  );
};

const ViewAddDocumentModal: React.FC<ViewAddDocumentModalProps> = (_props) => {
  // We intentionally do not destructure unused props to avoid ts(6198) warnings.
  return <ModalLayout heading="Add New Document" modalBodyContent={<ModalBodyContent />} />;
};

export default ViewAddDocumentModal;
