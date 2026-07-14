import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import { FormField } from "../../types/pdf.types";

interface ListBlockProps {
  field: FormField;
}

export const ListBlock: React.FC<ListBlockProps> = ({ field }) => {
  const items = field.items || [];

  return (
    <View style={pdfStyles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={pdfStyles.listItem}>
          <Text style={pdfStyles.listBullet}>•</Text>
          <Text style={pdfStyles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};
