import { pdf } from "@react-pdf/renderer";
import React from "react";
import { FormDocument } from "../FormDocument";
import { FormSchema, SubmissionData } from "../types/pdf.types";

/**
 * Generates a raw PDF Blob from the React PDF document schema and submission data in a virtual memory thread.
 */
export async function generateFormPdfBlob(
  schema: FormSchema,
  submissionData?: SubmissionData | null,
  signature?: string | null,
): Promise<Blob> {
  const docElement = React.createElement(FormDocument, {
    schema,
    submissionData,
    signature,
  });
  return await pdf(docElement as any).toBlob();
}

/**
 * Generates an object URL from the compiled PDF Blob, making it ready to stream inside our custom <PdfViewer>.
 */
export async function generateFormPdfUrl(
  schema: FormSchema,
  submissionData?: SubmissionData | null,
  signature?: string | null,
): Promise<string> {
  const blob = await generateFormPdfBlob(schema, submissionData, signature);
  return URL.createObjectURL(blob);
}

export function normalizeCheckboxGroups(values: any, schema: any) {
  const normalized = { ...values };

  schema.schema.fields.forEach((field: any) => {
    if (field.type === "checkbox-group") {
      const val = values[field.id];

      if (val && typeof val === "object" && !Array.isArray(val)) {
        // Convert object → array of selected keys
        normalized[field.id] = Object.entries(val)
          .filter(([_, checked]) => checked === true)
          .map(([key]) => key);
      }
    }
  });

  return normalized;
}

// Will remove it later
export const savePdfLocally = (file: File) => {
  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = file.name;

  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};
