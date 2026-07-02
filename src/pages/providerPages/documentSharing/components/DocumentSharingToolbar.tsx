import React from "react";
import SearchBar from "../../../../components/searchBar/SearchBar";
import Checkbox from "../../../../components/checkbox/Checkbox";

interface DocumentSharingToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allOnPageSelected: boolean;
  toggleSelectAllOnPage: (checked: boolean) => void;
  selectedDocIdsLength: number;
}

export const DocumentSharingToolbar: React.FC<DocumentSharingToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  allOnPageSelected,
  toggleSelectAllOnPage,
  selectedDocIdsLength,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
        <p className="text-[14px] text-textGreyColor">
          Pick documents from the library, then choose which clients to share
          them with. Documents can be shared multiple times.
        </p>
        <div className="w-[40%] min-w-65">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by document name or type..."
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <Checkbox
          checked={allOnPageSelected}
          onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
          text={
            allOnPageSelected
              ? "Deselect all on this page"
              : "Select all on this page"
          }
        />
        {selectedDocIdsLength > 0 && (
          <p className="text-[13px] text-textGreyColor">
            {selectedDocIdsLength} document{selectedDocIdsLength === 1 ? "" : "s"} selected
          </p>
        )}
      </div>
    </>
  );
};
