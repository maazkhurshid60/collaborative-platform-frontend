import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./styles/pdfStyles";
import { FormHeader } from "./components/layout/FormHeader";
import { SectionContainer } from "./components/layout/SectionContainer";
import { fieldRenderers } from "./renderers/fieldRenderers";
import { FormSchema, SubmissionData } from "./types/pdf.types";

interface FormDocumentProps {
  schema: FormSchema;
  submissionData?: SubmissionData | null;
  signature?: string | null;
}

export const FormDocument: React.FC<FormDocumentProps> = ({
  schema,
  submissionData,
  signature,
}) => {
  let parsedSchema = schema?.schema;
  if (typeof parsedSchema === "string") {
    try {
      parsedSchema = JSON.parse(parsedSchema);
    } catch (e) {
      console.error("Failed to parse schema JSON:", e);
    }
  }
  const rawFields = (parsedSchema as any)?.fields || [];

  let parsedSubmissionData = submissionData;
  if (typeof parsedSubmissionData === "string") {
    try {
      parsedSubmissionData = JSON.parse(parsedSubmissionData);
    } catch (e) {
      console.error("Failed to parse submissionData JSON:", e);
    }
  }

  // Clean fields array: ensure it supports both array format or object key mapping formats
  const fields = Array.isArray(rawFields)
    ? rawFields
    : Object.values(rawFields);

  return (
    <Document title={schema.title || "Form Template"}>
      <Page size="A4" style={pdfStyles.page}>
        {/* Accent branding header bar */}
        <View style={pdfStyles.accentBar} />

        {/* Professional Header Section */}
        <FormHeader
          title={schema.title}
          description={schema.description}
          clientName={schema.clientName}
        />

        {/* Dynamic Fields Grid */}
        <View style={pdfStyles.contentContainer}>
          {fields.map((field) => {
            const Renderer = fieldRenderers[field.type];
            if (!Renderer) return null;

            // Extract the value if the submission data exists
            const value = parsedSubmissionData
              ? parsedSubmissionData[field.id]
              : undefined;

            return (
              <SectionContainer key={field.id} type={field.type}>
                <Renderer
                  field={field}
                  value={value}
                  signature={signature}
                  isSubmitted={!!parsedSubmissionData}
                />
              </SectionContainer>
            );
          })}
        </View>

        {/* Page numbering in footer and HIPAA compliance stamp */}
        <Text
          style={pdfStyles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Certified E-Signature Document — Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
