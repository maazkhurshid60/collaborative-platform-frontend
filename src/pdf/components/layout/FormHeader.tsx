import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "../../styles/pdfStyles";
import logo from "@/assets/images/main-logo.png";

interface FormHeaderProps {
  title?: string;
  description?: string;
  clientName?: string | null;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  description,
  clientName,
}) => {
  return (
    <View style={pdfStyles.header} fixed>
      <View style={pdfStyles.headerDetails}>
        <Text style={pdfStyles.title}>{title || "Form Template"}</Text>
        {description ? (
          <Text style={pdfStyles.description}>{description}</Text>
        ) : null}
        {clientName ? (
          <View style={pdfStyles.badgeContainer}>
            <Text style={pdfStyles.badge}>
              Authorized Recipient: {clientName}
            </Text>
          </View>
        ) : null}
      </View>
      <Image src={logo} style={pdfStyles.logo} />
    </View>
  );
};
