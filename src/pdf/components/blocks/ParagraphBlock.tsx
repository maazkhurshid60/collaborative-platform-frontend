import React from "react";
import Html from "react-pdf-html";
import { FormField } from "../../types/pdf.types";

interface ParagraphBlockProps {
  field: FormField;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ field }) => {
  return (
    <Html
      style={{
        fontSize: 10,
        color: "#475569",
        lineHeight: 1.6,
        marginBottom: 12,
      }}
      stylesheet={{
        p: {
          margin: 0,
        }
      }}
    >
      {field.text || ""}
    </Html>
  );
};
