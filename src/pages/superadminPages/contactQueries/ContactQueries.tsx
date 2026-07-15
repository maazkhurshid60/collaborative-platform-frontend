import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Loader from "../../../components/loader/Loader";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import SearchBar from "../../../components/searchBar/SearchBar";
import ModalLayout from "../../../components/modals/modalLayout/ModalLayout";
import ViewIcon from "../../../components/icons/view/View";
import { useDebounce } from "../../../hook/useDebounce";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";
import Table from "@/components/table/Table";

const limit = 10;
const heading = ["Name", "Email", "Phone", "Submitted At", "Action"];

const ContactQueries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["contactQueries", page, debouncedSearchTerm],
    queryFn: async () => {
      const response = await superAdminApi.getContactQueries({
        page,
        limit,
        search: debouncedSearchTerm,
      });
      return response;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  console.log("Data is here : ", data);
  const queries = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewDetails = (query: any) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  return (
    <OutletLayout
      heading="Contact Queries"
      parentContainerClasses="h-[calc(100vh-5rem)] overflow-y-auto"
    >
      {isLoading && <Loader text="Loading queries..." />}

      {isModalOpen && selectedQuery && (
        <ModalLayout
          heading="Contact Query Details"
          onClose={() => setIsModalOpen(false)}
          modalBodyContent={
            <div className="p-4 bg-gray-50 rounded-lg overflow-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedQuery.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href={`mailto:${selectedQuery.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedQuery.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="font-medium text-gray-800">
                    {selectedQuery.phone || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(
                      new Date(selectedQuery.createdAt),
                      "MMM dd, yyyy hh:mm:ss a",
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Message
                </p>
                <div className="bg-white p-4 border border-gray-100 rounded-md shadow-sm whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {selectedQuery.message}
                </div>
              </div>
            </div>
          }
        />
      )}

      <div className="bg-white p-4 rounded-xl  shadow-sm mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/3">
            <SearchBar
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              placeholder="Search by Email..."
            />
          </div>
        </div>

        {!isLoading && queries.length === 0 ? (
          <NoRecordFound />
        ) : (
          <div className="w-full">
            <Table
              heading={heading}
              children={
                <>
                  {queries.map((query: any, index: number) => (
                    <tr
                      key={query?.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        {query.name}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {query.email}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {query.phone || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {format(new Date(query.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            title="View Details"
                            onClick={() => handleViewDetails(query)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <ViewIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              }
            />

            {totalPages > 1 && (
              <div className="mt-6 flex justify-end items-center border-t border-gray-100 pt-4">
                <CustomPagination
                  hookCurrentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </OutletLayout>
  );
};

export default ContactQueries;
