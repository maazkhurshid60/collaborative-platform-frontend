import React from "react";
import { Text } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FormField } from "../../types/pdf.types";

interface ParagraphBlockProps {
  field: FormField;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ field }) => {
  return <Text style={pdfStyles.paragraph}>{field.text || ""}</Text>;
};
