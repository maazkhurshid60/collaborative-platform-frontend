import React from "react";
import { FormField } from "@/pdf/types/pdf.types";

interface ProviderSectionFormViewProps {
  field: FormField;
}

const ProviderSectionFormView: React.FC<ProviderSectionFormViewProps> = ({
  field,
}) => {
  const Tag =
    (["h2", "h3", "h4", "h5", "h6", "h6"] as const)[(field.level ?? 2) - 1] ??
    "h3";

  return (
    <div className="mt-8 mb-4 border-l-4 border-primaryColorLight pl-4 py-2 bg-gray-50 rounded-r-lg">
      <Tag className="text-sm font-bold text-gray-800 uppercase tracking-wider text-left">
        {field.text || "For Provider Use Only"}
      </Tag>
      <p className="text-xs text-gray-500 mt-1">
        This section was pre-filled by your provider.
      </p>
    </div>
  );
};

export default ProviderSectionFormView;
