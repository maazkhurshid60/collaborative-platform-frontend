import React from "react";
import { Text } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FormField } from "../../types/pdf.types";

interface HeadingBlockProps {
  field: FormField;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ field }) => {
  const level = field.level || 2;
  let style = pdfStyles.h2;

  if (level === 1) {
    style = pdfStyles.h1;
  } else if (level === 2) {
    style = pdfStyles.h2;
  } else if (level === 3) {
    style = pdfStyles.h3;
  } else if (level === 4) {
    style = pdfStyles.h4;
  } else if (level === 5) {
    style = pdfStyles.h5;
  } else if (level >= 6) {
    style = pdfStyles.h6;
  }

  return <Text style={style}>{field.text || ""}</Text>;
};
