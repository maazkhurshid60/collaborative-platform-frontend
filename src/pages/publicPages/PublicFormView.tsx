import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axiosInstance from "../../apiServices/axiosInstance/AxiosInstance";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { generateSubmittedFormHtml } from "../../utils/formUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface FormField {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "text"
    | "date"
    | "checkbox-group"
    | "boolean"
    | "signature";
  label?: string;
  required?: boolean;
  options?: string[];
  validation?: any;
  level?: number;
  text?: string;
  items?: string[];
}

interface FormSchema {
  title: string;
  description?: string;
  schema: {
    fields: FormField[];
  };
  clientId?: string;
  clientName?: string;
}

export default function PublicFormView() {
  const { token } = useParams<{ token: string }>();

  // Fetch logged in user details from Redux store to verify client-only permission
  const userDetails = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );
  const loginUserRole = userDetails?.user?.role;
  const isAuthenticated = !!userDetails?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const {
    data: formSchema,
    isLoading,
    error: queryError,
  } = useQuery<FormSchema>({
    queryKey: ["publicForm", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const res = await axiosInstance.get(`/form/token/${token}`);
      return res.data.data;
    },
    enabled: !!token,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const errorState = useMemo(() => {
    if (!queryError) return null;
    const axiosErr = queryError as any;
    const status = axiosErr.response?.status || 500;
    const message =
      axiosErr.response?.data?.message ||
      "This form is unavailable or invalid.";
    return { status, message };
  }, [queryError]);

  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!formSchema || !submittedValues) {
      toast.error("Form template or values not available.");
      return;
    }
    setIsGeneratingPdf(true);

    const sigField = formSchema.schema.fields.find(
      (f) => f.type === "signature",
    );
    const sig = sigField ? submittedValues[sigField.id] : null;

    const htmlContent = generateSubmittedFormHtml(
      formSchema,
      submittedValues,
      sig,
    );

    // Create temporary container in DOM to render this HTML
    const tempContainer = document.createElement("div");
    tempContainer.id = "pdf-temp-container-download";
    tempContainer.style.position = "fixed";
    tempContainer.style.top = "0";
    tempContainer.style.left = "0";
    tempContainer.style.opacity = "0";
    tempContainer.style.zIndex = "-9999";
    tempContainer.style.width = "800px";
    tempContainer.style.background = "#ffffff";
    tempContainer.style.padding = "40px";
    tempContainer.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    tempContainer.style.lineHeight = "1.5";
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    try {
      // Wait for styling, reflow, and web fonts (like cursive signature font) to fully load
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.getElementById("pdf-temp-container-download");
          if (clonedContainer) {
            clonedContainer.style.opacity = "1";
          }
        }
      });

      if (canvas.width > 0 && canvas.height > 0) {
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position -= pageHeight;
          }
        }
      }

      pdf.save(`${formSchema.title || "completed_form"}_signed.pdf`);
      toast.success("Completed PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      document.body.removeChild(tempContainer);
      setIsGeneratingPdf(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post(`/form/submit/${token}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Form submitted and permanently locked.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to submit form.";
      toast.error(msg);
    },
  });

  const isCompleted = mutation.isSuccess;
  const submittedId = mutation.data?.submissionId;
  const isSubmitting = mutation.isPending || customSubmitting;
  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Restrict access exclusively to client role
  if (loginUserRole && loginUserRole !== "client") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 mb-6 font-medium text-sm leading-relaxed">
            This document view is protected and can only be opened and signed by
            clients.
          </p>
          <a
            href={
              loginUserRole === "superAdmin" ? "/pending-users" : "/dashboard"
            }
            className="inline-flex items-center justify-center rounded-lg bg-primaryColorDark hover:bg-opacity-95 px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md w-full"
          >
            Go back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: any) => {
    if (!token || !formSchema) return;

    const sigField = formSchema.schema.fields.find(
      (f) => f.type === "signature",
    );
    if (sigField && !values[sigField.id]) {
      toast.error(
        "Legal E-Signature is required to submit and lock this form.",
      );
      return;
    }

    setCustomSubmitting(true);
    setSubmittedValues(values);

    let pdfUrl = null;

    try {
      const sig = sigField ? values[sigField.id] : null;
      const htmlContent = generateSubmittedFormHtml(formSchema, values, sig);

      // Create temporary container in DOM to render this HTML
      const tempContainer = document.createElement("div");
      tempContainer.id = "pdf-temp-container-submit";
      tempContainer.style.position = "fixed";
      tempContainer.style.top = "0";
      tempContainer.style.left = "0";
      tempContainer.style.opacity = "1";
      tempContainer.style.zIndex = "-9999";
      tempContainer.style.width = "800px";
      tempContainer.style.background = "#ffffff";
      tempContainer.style.padding = "40px";
      tempContainer.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      tempContainer.style.lineHeight = "1.5";
      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);

      // Wait for styling, reflow, and web fonts (like cursive signature font) to fully load
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(tempContainer);

      if (canvas.width > 0 && canvas.height > 0) {
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position -= pageHeight;
          }
        }
      }

      const pdfBlob = pdf.output("blob");
      const pdfFile = new File(
        [pdfBlob],
        `${formSchema.title || "completed_form"}_signed.pdf`,
        { type: "application/pdf" },
      );

      const formData = new FormData();
      formData.append("file", pdfFile);

      const uploadRes = await axiosInstance.post(`/form/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      pdfUrl = uploadRes.data.url;
    } catch (err) {
      console.error("Failed to generate/upload submitted form PDF copy:", err);
    }

    const payload = {
      submittedBy: formSchema?.clientId || "guest-client",
      data: values,
      signature: sigField ? values[sigField.id] : "signed",
      pdfUrl,
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setCustomSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          Securing and loading document template...
        </p>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {errorState.status === 423 ? (
            <div className="mb-6 flex justify-center text-amber-500">
              {/* Locked Icon */}
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          ) : (
            <div className="mb-6 flex justify-center text-red-500">
              {/* Warn Icon */}
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {errorState.status === 423
              ? "Form Already Completed"
              : "Form Access Denied"}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {errorState.message}
          </p>
          <div className="border-t border-gray-100 pt-6">
            <span className="text-xs text-gray-400 font-mono">
              HIPAA Transaction Code: {errorState.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted || !formSchema) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center">
          <div className="mb-6 flex justify-center text-green-500">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Form Locked & Submitted
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you, {formSchema?.clientName || "Client"}. Your record has
            been legally sealed, encrypted, and locked to prevent tampering in
            compliance with HIPAA privacy acts.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 text-left">
            <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Confirmation Lock ID
            </div>
            <div className="text-sm font-mono text-gray-700 break-all select-all">
              {submittedId || "LOCKED_RECORD_OK"}
            </div>
          </div>

          {submittedValues && (
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="mb-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 transition duration-150 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isGeneratingPdf
                ? "Generating PDF..."
                : "Download Completed PDF Copy"}
            </button>
          )}

          <div className="text-xs text-gray-400 font-mono">
            Transaction Sealed: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        {/* Sleek Blue/Indigo Header Accent */}
        <div className="h-2 bg-primaryColorDark" />

        <div className="p-8">
          <div className="border-b border-gray-100 pb-6 mb-8 text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formSchema.title}
            </h1>
            {formSchema.description && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {formSchema.description}
              </p>
            )}
            {formSchema.clientName && (
              <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primaryColorLight/30 text-primaryColorDark">
                Authorized Recipient: {formSchema.clientName}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {formSchema.schema.fields.map((field) => {
              // 1. Render Informational / Layout Blocks (Non-Input)
              if (field.type === "heading") {
                const Tag =
                  field.level === 1 ? "h2" : field.level === 2 ? "h3" : "h4";
                const sizeClass =
                  field.level === 1
                    ? "text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2"
                    : field.level === 2
                      ? "text-xl font-semibold text-gray-800 mt-6 mb-3"
                      : "text-lg font-medium text-gray-700 mt-4 mb-2";
                return (
                  <Tag key={field.id} className={`${sizeClass} text-left`}>
                    {field.text}
                  </Tag>
                );
              }

              if (field.type === "paragraph") {
                return (
                  <p
                    key={field.id}
                    className="text-sm text-gray-600 mb-4 text-left leading-relaxed"
                  >
                    {field.text}
                  </p>
                );
              }

              if (field.type === "list") {
                return (
                  <ul
                    key={field.id}
                    className="list-disc pl-5 mb-4 text-sm text-gray-600 text-left space-y-2"
                  >
                    {field.items?.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              // 2. Render Interactive Input Form Fields
              return (
                <div key={field.id} className="space-y-2 text-left">
                  <label className="block text-sm font-semibold text-gray-700">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      {...register(field.id, { required: field.required })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                        errors[field.id]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder={`Enter your ${field.label?.toLowerCase()}`}
                    />
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      {...register(field.id, { required: field.required })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                        errors[field.id]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  )}

                  {field.type === "boolean" && (
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          {...register(field.id, { required: field.required })}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded transition duration-150"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="text-gray-500">
                          I declare my agreement and assent.
                        </span>
                      </div>
                    </div>
                  )}

                  {field.type === "signature" && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          ENTER YOUR NAME TO SIGN
                        </label>
                        <input
                          type="text"
                          {...register(field.id, { required: field.required })}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                            errors[field.id]
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Type your full name"
                        />
                      </div>

                      {/* Signature Cursive Preview */}
                      <div className="border border-dashed border-gray-300 rounded-lg bg-white p-6 flex flex-col justify-center items-center min-h-[120px] transition duration-150 relative">
                        {watch(field.id) ? (
                          <div className="text-center">
                            <span
                              style={{
                                fontFamily:
                                  "'Great Vibes', 'Playball', 'Georgia', cursive",
                                fontSize: "36px",
                                fontWeight: "normal",
                                color: "#1e293b",
                                fontStyle: "italic",
                              }}
                              className="block break-all"
                            >
                              {watch(field.id)}
                            </span>
                            <div className="border-t border-gray-100 mt-2 pt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Certified E-Signature
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-8 h-8 mx-auto mb-1 opacity-40 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            <span>Your styled signature will show up here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errors[field.id] && (
                    <p className="text-red-500 text-xs font-medium">
                      {field.label || "This field"} is required.
                    </p>
                  )}
                </div>
              );
            })}

            <div className="pt-8 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primaryColorDark hover:bg-primaryColorDark/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryColorDark disabled:bg-gray-300 transition duration-150"
              >
                {isSubmitting
                  ? "Locking & Submitting Record..."
                  : "Submit and Lock Form"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
