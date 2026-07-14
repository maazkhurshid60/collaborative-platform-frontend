import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";
import { formatDateValue } from "../../utils/formatters";

export const DateField: React.FC<FieldRendererProps> = ({
  field,
  value,
  isSubmitted,
}) => {
  const formattedDate = formatDateValue(value);

  return (
    <View style={pdfStyles.fieldGroup}>
      <Text style={pdfStyles.fieldLabel}>
        {field.label || "Date"}{" "}
        {field.required ? <Text style={pdfStyles.fieldRequired}>*</Text> : null}
      </Text>
      <View style={pdfStyles.fieldValueBox}>
        {isSubmitted ? (
          formattedDate ? (
            <Text style={pdfStyles.fieldValueText}>{formattedDate}</Text>
          ) : (
            <Text style={pdfStyles.fieldValuePlaceholder}>—</Text>
          )
        ) : (
          <Text style={pdfStyles.fieldValuePlaceholder}>YYYY-MM-DD</Text>
        )}
      </View>
    </View>
  );
};
