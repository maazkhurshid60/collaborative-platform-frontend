import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

import { pdfTokens } from "../../styles/pdfStyles";
import { FormField } from "../../types/pdf.types";

interface ProviderSectionBlockProps {
  field: FormField;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: pdfTokens.colors.subtle,
    borderLeftStyle: "solid",
    paddingLeft: 10,
    paddingVertical: 6,
    backgroundColor: pdfTokens.colors.surface,
  },
  title: {
    fontSize: 9,
    fontWeight: "bold",
    color: pdfTokens.colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  description: {
    fontSize: 8,
    color: pdfTokens.colors.muted,
  },
});

export const ProviderSectionBlock: React.FC<ProviderSectionBlockProps> = ({
  field,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{field.text || "For Provider Use Only"}</Text>
      <Text style={styles.description}>
        This section was pre-filled by your provider.
      </Text>
    </View>
  );
};
