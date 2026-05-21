import React from "react";
import { View, Text, Svg, Path } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";
import { isBooleanChecked } from "../../utils/formatters";

export const BooleanField: React.FC<FieldRendererProps> = ({
  field,
  value,
  isSubmitted,
}) => {
  const isChecked = isSubmitted && isBooleanChecked(value);

  return (
    <View style={pdfStyles.booleanWrapper}>
      <View style={pdfStyles.booleanBox}>
        {isChecked ? (
          <Svg width="9" height="9" viewBox="0 0 24 24" style={{ width: 9, height: 9 }}>
            <Path
              d="M4.5 12.75l6 6 9-13.5"
              fill="none"
              stroke="#0F9282"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>
      <Text style={pdfStyles.booleanLabel}>
        {field.label || "I agree"}{" "}
        {field.required ? <Text style={pdfStyles.fieldRequired}>*</Text> : null}
      </Text>
    </View>
  );
};

