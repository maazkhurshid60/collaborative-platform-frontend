import React from "react";
import { View, Text, Svg, Path } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";
import { isCheckboxOptionChecked } from "../../utils/formatters";

export const CheckboxGroupField: React.FC<FieldRendererProps> = ({
  field,
  value,
  isSubmitted,
}) => {
  const options = field.options || [];

  return (
    <View style={pdfStyles.fieldGroup}>
      <Text style={pdfStyles.fieldLabel}>
        {field.label || "Options"}{" "}
        {field.required ? <Text style={pdfStyles.fieldRequired}>*</Text> : null}
      </Text>
      <View style={pdfStyles.checkboxContainer}>
        {options.map((opt, index) => {
          const isChecked = isSubmitted && isCheckboxOptionChecked(opt, value);

          return (
            <View key={index} style={pdfStyles.checkboxItem}>
              <View style={pdfStyles.checkboxBox}>
                {isChecked ? (
                  <Svg width="9" height="9" viewBox="0 0 24 24" style={{ width: 9, height: 9 }}>
                    <Path
                      d="M4.5 12.75l6 6 9-13.5"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : null}
              </View>
              <Text style={pdfStyles.checkboxLabel}>{opt}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

