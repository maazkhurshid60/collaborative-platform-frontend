import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

import { pdfTokens } from "../../styles/pdfStyles";
import { FormField } from "../../types/pdf.types";

interface ClientSectionBlockProps {
  field: FormField;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6", // blue-500 — distinct from provider's slate
    borderLeftStyle: "solid",
    paddingLeft: 10,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF", // blue-50
  },
  title: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1E3A5F", // deep blue for contrast on blue-50
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  description: {
    fontSize: 8,
    color: pdfTokens.colors.muted,
  },
});

export const ClientSectionBlock: React.FC<ClientSectionBlockProps> = ({
  field,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{field.text || "For Client Use Only"}</Text>
      <Text style={styles.description}>
        This section is intended to be completed by the client.
      </Text>
    </View>
  );
};
