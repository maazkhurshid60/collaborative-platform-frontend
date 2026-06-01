import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";

export const SignatureField: React.FC<FieldRendererProps> = ({
  field,
  value,
  signature,
  isSubmitted,
}) => {
  // Use submission value if available, fall back to explicit signature prop
  const sigValue = value || signature || "";
  const isImage =
    typeof sigValue === "string" &&
    (sigValue.startsWith("data:") ||
      sigValue.startsWith("http://") ||
      sigValue.startsWith("https://"));

  return (
    <View style={pdfStyles.fieldGroup}>
      <Text style={pdfStyles.fieldLabel}>
        {field.label || "Signature"}{" "}
        {field.required ? <Text style={pdfStyles.fieldRequired}>*</Text> : null}
      </Text>
      
      <View style={pdfStyles.signatureContainer}>
        <View style={pdfStyles.signatureWrapper}>
          {isSubmitted && sigValue ? (
            isImage ? (
              // Image signature
              <Image src={sigValue} style={pdfStyles.signatureImage} />
            ) : (
              // Typed text signature
              <Text style={pdfStyles.signatureText}>{sigValue}</Text>
            )
          ) : isSubmitted ? (
            // Submitted but signature was not provided
            <Text style={pdfStyles.signatureEmpty}>Signature (Not Provided)</Text>
          ) : (
            // Blank template signature preview
            <Text style={pdfStyles.signatureEmpty}>Signature Preview</Text>
          )}

          {isSubmitted && sigValue ? (
            <View style={pdfStyles.signatureStamp}>
              <Text style={pdfStyles.signatureStampText}>Certified E-Signature</Text>
            </View>
          ) : (
            <View style={pdfStyles.signatureStamp}>
              <Text style={pdfStyles.signatureStampText}>Certified E-Signature Preview</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
