import { useMemo, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";

import { RootState } from "../../redux/store";
import axiosInstance from "../../apiServices/axiosInstance/AxiosInstance";
import {
  generateFormPdfBlob,
  normalizeCheckboxGroups,
  savePdfLocally,
} from "../../pdf/utils/pdfHelpers";
import DocLock from "./DocLock";
import FormSubmitted from "./FormSubmitted";
import Loader from "@/components/loader/Loader";
import NotAuthorizedToSign from "./NotAuthorizedToSign";
import { PDFFormViewSchema } from "@/pdf/types/pdf.types";
import SignatureFormView from "./formView/SignatureView";
import RadioGroupFormView from "./formView/RadioGroupFormView";
import CheckboxFormView from "./formView/CheckboxFormView";
import ProviderSectionFormView from "./formView/ProviderSectionFormView";

function PublicFormView() {
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { token } = useParams<{ token: string }>();

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
  } = useQuery<PDFFormViewSchema>({
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

  useEffect(() => {
    if (formSchema?.providerData) {
      Object.entries(formSchema.providerData).forEach(([key, val]) => {
        setValue(key, val);
      });
    }
  }, [formSchema, setValue]);

  const handleDownloadPDF = async () => {
    if (!formSchema || !submittedValues) {
      toast.error("Form template or values not available.");
      return;
    }
    setIsGeneratingPdf(true);

    try {
      const sigField = formSchema.schema.fields.find(
        (f) => f.type === "signature",
      );
      const sig = sigField ? submittedValues[sigField.id] : null;

      // Compile pixel-perfect React PDF in memory
      const pdfBlob = await generateFormPdfBlob(
        formSchema,
        submittedValues,
        sig,
      );
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Trigger standard native file download
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${formSchema.title || "completed_form"}_signed.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);

      toast.success("Completed PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isCompleted = mutation.isSuccess;
  const submittedId = mutation.data?.submissionId;
  const isSubmitting = mutation.isPending || customSubmitting;
  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Restrict access exclusively to client role
  if (loginUserRole && loginUserRole !== "client") {
    return <NotAuthorizedToSign role={loginUserRole} />;
  }

  const onSubmit = async (values: any) => {
    if (!token || !formSchema) return;

    // Validate required checkbox-groups (Checklists)
    const missingFields: string[] = [];
    formSchema.schema.fields.forEach((field) => {
      if (
        (field.type === "checkbox-group" || field.type === "radio-group") &&
        field.required
      ) {
        const val = values[field.id];
        let hasSelection = false;
        if (val && typeof val === "object") {
          hasSelection = Object.values(val).some((v) => !!v);
        } else if (Array.isArray(val)) {
          hasSelection = val.length > 0;
        } else if (typeof val === "string") {
          hasSelection = val.trim() !== "";
        }
        if (!hasSelection) {
          missingFields.push(field.label || "Check List");
        }
      }
    });

    if (missingFields.length > 0) {
      toast.error(
        `Please select at least one option for: ${missingFields.join(", ")}`,
      );
      return;
    }

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
    const normalizeValues = normalizeCheckboxGroups(values, formSchema);
    setSubmittedValues(normalizeValues);

    let pdfUrl = null;

    try {
      const sig = sigField ? values[sigField.id] : null;

      // Compile signed PDF completely in memory (virtual thread)
      const pdfBlob = await generateFormPdfBlob(
        formSchema,
        normalizeValues,
        sig,
      );
      const pdfFile = new File(
        [pdfBlob],
        `${formSchema.title || "completed_form"}_signed.pdf`,
        { type: "application/pdf" },
      );

      // savePdfLocally(pdfFile);

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

    // setCustomSubmitting(false);

    // return;

    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setCustomSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (errorState) {
    return <DocLock errorState={errorState} />;
  }

  if (isCompleted || !formSchema) {
    return (
      <FormSubmitted
        submittedValues={submittedValues}
        submittedId={submittedId}
        clientName={formSchema?.clientName}
        isGeneratingPdf={isGeneratingPdf}
        handleDownloadPDF={handleDownloadPDF}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-2 bg-primaryColorDark" />

        <div className="p-8">
          <div className="border-b border-gray-100 pb-6 mb-8 text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formSchema.title}
            </h1>
            {formSchema.description && (
              <div
                className="mt-2 text-sm text-gray-500 leading-relaxed w-full overflow-hidden **:max-w-full **:whitespace-pre-wrap **:wrap-break-word [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold"
                dangerouslySetInnerHTML={{ __html: formSchema.description }}
              />
            )}
            {formSchema.clientName && (
              <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primaryColorLight/30 text-primaryColorDark">
                Authorized Recipient: {formSchema.clientName}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {(() => {
              let inProvider = false;
              return formSchema.schema.fields.map((field) => {
                // 1. Render Informational / Layout Blocks (Non-Input)
                if (field.type === "provider-section") {
                  inProvider = true;
                  return (
                    <ProviderSectionFormView key={field.id} field={field} />
                  );
                } else if (field.type === "heading") {
                  inProvider = false; // reset
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
                    <div
                      key={field.id}
                      className="text-sm text-gray-600 mb-4 text-left leading-relaxed w-full overflow-hidden **:max-w-full **:whitespace-pre-wrap **:wrap-break-word [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: field.text || "" }}
                    />
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

                const isProviderField = inProvider;

                return (
                  <div key={field.id} className="space-y-2 text-left">
                    <label className="block text-sm font-semibold text-gray-700">
                      {field.label}{" "}
                      {field.required && !isProviderField && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        {...register(field.id, {
                          required: !isProviderField && field.required,
                        })}
                        disabled={isProviderField}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primaryColorDark focus:border-primaryColorDark transition duration-150 ${
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
                        {...register(field.id, {
                          required: !isProviderField && field.required,
                        })}
                        disabled={isProviderField}
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
                            {...register(field.id, {
                              required: !isProviderField && field.required,
                            })}
                            disabled={isProviderField}
                            className="focus:ring-primaryColorDark h-4 w-4 text-primaryColorDark border-gray-300 rounded transition duration-150"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <span className="text-gray-500">
                            I declare my agreement and assent.
                          </span>
                        </div>
                      </div>
                    )}
                    {field.type === "checkbox-group" && (
                      <CheckboxFormView
                        field={field}
                        watch={watch}
                        setValue={setValue}
                        disabled={isProviderField}
                      />
                    )}

                    {field.type === "radio-group" && (
                      <RadioGroupFormView
                        field={field}
                        register={register}
                        disabled={isProviderField}
                      />
                    )}

                    {field.type === "signature" && (
                      <div className="space-y-2 text-left">
                        <SignatureFormView
                          field={field}
                          register={register}
                          errors={errors}
                          watch={watch}
                          disabled={isProviderField}
                        />
                      </div>
                    )}

                    {errors[field.id] && !isProviderField && (
                      <p className="text-red-500 text-xs font-medium">
                        {field.label || "This field"} is required.
                      </p>
                    )}
                  </div>
                );
              });
            })()}

            <div>
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

export default PublicFormView;
