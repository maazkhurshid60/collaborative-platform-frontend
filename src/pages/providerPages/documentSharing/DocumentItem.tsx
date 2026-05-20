import React from "react";
import Checkbox from "../../../components/checkbox/Checkbox";
import { IoDocumentTextOutline } from "react-icons/io5";
import ViewIcon from "../../../components/icons/view/View";

interface DocumentItemProps {
  doc: any;
  serialNo: number;
  isSelected: boolean;
  signed: number;
  sharedOnly: number;
  toggleSelectDoc: (id: string, checked: boolean) => void;
  handleViewRecipients: (doc: any, filterStatus?: "signed" | "awaiting") => void;
  handleViewDocument: (doc: any) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  doc,
  serialNo,
  isSelected,
  signed,
  sharedOnly,
  toggleSelectDoc,
  handleViewRecipients,
  handleViewDocument,
}) => {
  return (
    <tr className="border-b border-b-solid border-b-lightGreyColor">
      {/* Checkbox */}
      <td className="px-4 py-3 align-middle w-[44px]">
        <Checkbox
          checked={isSelected}
          onChange={(e) => toggleSelectDoc(doc.id, e.target.checked)}
        />
      </td>

      {/* S.No */}
      <td className="px-4 py-3 align-middle whitespace-nowrap w-[40px]">
        {serialNo}
      </td>

      {/* Document */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-x-3 min-w-0">
          <IoDocumentTextOutline className="text-primaryColorDark text-2xl shrink-0" />
          <span
            className="block truncate font-medium text-[14px] max-w-[180px] sm:max-w-[240px] lg:max-w-[320px] xl:max-w-[420px]"
            title={doc.name}
          >
            {doc.name}
          </span>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3 align-middle whitespace-nowrap capitalize">
        {doc.type ?? "-"}
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex items-center gap-x-2">
          <button
            type="button"
            onClick={() => handleViewRecipients(doc, undefined)}
            title="See all clients shared with"
            className="px-3 py-1 rounded-md text-xs font-medium bg-primaryColorDark/10 text-primaryColorDark hover:opacity-85 transition-opacity cursor-pointer border-0 outline-none"
          >
            {sharedOnly} shared
          </button>
          <button
            type="button"
            onClick={() => handleViewRecipients(doc, "signed")}
            title={
              doc.isForm
                ? "See client form submissions"
                : "See clients who signed"
            }
            className="px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:opacity-85 transition-opacity cursor-pointer border-0 outline-none"
          >
            {signed} {doc.isForm ? "submitted" : "signed"}
          </button>
        </div>
      </td>

      {/* Created */}
      <td className="px-4 py-3 align-middle whitespace-nowrap text-textGreyColor text-[13px]">
        {new Date(doc.createdAt).toLocaleDateString()}
      </td>

      {/* Action */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex items-center justify-start gap-x-1.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <ViewIcon onClick={() => handleViewDocument(doc)} />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DocumentItem;
