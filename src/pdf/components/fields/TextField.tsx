import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";

export const TextField: React.FC<FieldRendererProps> = ({
  field,
  value,
  isSubmitted,
}) => {
  return (
    <View style={pdfStyles.fieldGroup}>
      <Text style={pdfStyles.fieldLabel}>
        {field.label || "Text Input"}{" "}
        {field.required ? <Text style={pdfStyles.fieldRequired}>*</Text> : null}
      </Text>
      <View style={pdfStyles.fieldValueBox}>
        {isSubmitted ? (
          value ? (
            <Text style={pdfStyles.fieldValueText}>{String(value)}</Text>
          ) : (
            <Text style={pdfStyles.fieldValuePlaceholder}>—</Text>
          )
        ) : (
          <Text style={pdfStyles.fieldValuePlaceholder}>(Empty)</Text>
        )}
      </View>
    </View>
  );
};
