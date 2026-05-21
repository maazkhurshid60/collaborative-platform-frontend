import React from "react";
import { View, Text, Svg, Circle } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FieldRendererProps } from "../../types/pdf.types";

export const RadioGroupField: React.FC<FieldRendererProps> = ({
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
          // A radio group value is typically a single string
          const isChecked = isSubmitted && value === opt;

          return (
            <View key={index} style={pdfStyles.checkboxItem}>
              {/* Radio Button Circle styling using similar size as checkbox but rounded */}
              <View style={[pdfStyles.checkboxBox, { borderRadius: 6 }]}>
                {isChecked ? (
                  <Svg width="6" height="6" viewBox="0 0 24 24" style={{ width: 6, height: 6 }}>
                    <Circle cx="12" cy="12" r="10" fill="#0f172a" />
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
