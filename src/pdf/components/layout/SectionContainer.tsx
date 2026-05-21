import React from "react";
import { View } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldType } from "../../types/pdf.types";

interface SectionContainerProps {
  type: FieldType;
  children: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  type,
  children,
}) => {
  const isInputOrInteractive = [
    "text",
    "date",
    "checkbox-group",
    "boolean",
    "signature",
  ].includes(type);

  return (
    <View style={pdfStyles.section} wrap={false}>
      {children}
    </View>
  );
};
