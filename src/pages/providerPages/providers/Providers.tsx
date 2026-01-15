// Providers.tsx
// Alignment fixes applied:
// - Consistent td padding/vertical alignment across ALL columns
// - Prevent wrapping in narrow columns (email/status/action) to avoid column drift
// - Fix Action column padding (was missing px-2) and center alignment
// - Clients column: allow wrapping inside cell without breaking table grid
// - Uses the same Table.tsx (table-fixed recommended)

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";

import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";

import { Link, useNavigate } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import providerApiService from "../../../apiServices/providerApi/ProviderApi";
import { useQuery } from "@tanstack/react-query";
import { Client, ProviderType } from "../../../types/providerType/ProviderType";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ViewIcon from "../../../components/icons/view/View";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import { useMemo, useState } from "react";
import { filterProviders } from "../../../utils/FilteredUsers";
import SearchBar from "../../../components/searchBar/SearchBar";

const Providers = () => {
  const heading = [
    "S.No.",
    "Name",
    "License Number",
    "Gender",
    "Email",
    "Status",
    "Clients",
    "Action",
  ];

  const navigate = useNavigate();

  const loginUserDetail = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id
  );

  const [searchTerm, setSearchTerm] = useState("");

  const { data: providerData, isLoading, isError } = useQuery<ProviderType[]>({
    queryKey: ["providers", loginUserDetail],
    queryFn: async () => {
      try {
        const response = await providerApiService.getAllProviders(loginUserDetail);
        return response?.data?.providers ?? [];
      } catch (error) {
        console.error("Error fetching providers:", error);
        return [];
      }
    },
    enabled: Boolean(loginUserDetail),
  });

  const recordPerPage = 6;

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({ data: providerData ?? [], recordPerPage });

  const currentRecords = getCurrentRecords() ?? [];

  const filteredData = useMemo(() => {
    return currentRecords.filter((p) => !p?.user?.blockedMembers?.includes(loginUserDetail));
  }, [currentRecords, loginUserDetail]);

  const filteredSearchProviders = useMemo(() => {
    return filterProviders(filteredData || [], searchTerm);
  }, [filteredData, searchTerm]);

  const downloadXLS = (data: ProviderType[], fileName: string = "providers.xls") => {
    const formattedData = data.map((provider, index) => ({
      "S.No.": (currentPage - 1) * recordPerPage + index + 1,
      Name: provider?.user?.fullName ?? "",
      License: provider?.user?.licenseNo ?? "",
      Contact: provider?.user?.contactNo ?? "",
      Gender: provider?.user?.gender ?? "",
      Email: provider?.email ?? "",
      Status: provider?.user?.status ?? "",
      Role: provider?.user?.role ?? "",
      Clients:
        (provider?.clientList as { client: { user: { fullName: string } } }[])
          ?.map((c) => c?.client?.user?.fullName ?? "")
          .join(", ") || "No Clients",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Provider Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xls", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/vnd.ms-excel" });
    saveAs(fileBlob, fileName);
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>Something went wrong</p>;

  return (
    <OutletLayout
      heading="Providers List"
      button={<Button text="Download xls" onclick={() => downloadXLS(currentRecords)} />}
    >
      <div className="flex items-center md:justify-end mt-6">
        <div className="w-[100%] md:w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, state, role, etc..."
          />
        </div>
      </div>

      <div className="mt-10">
        {filteredSearchProviders?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {filteredSearchProviders.map((data: ProviderType, index: number) => {
                const serialNo = (currentPage - 1) * recordPerPage + index + 1;

                return (
                  <tr
                    key={data?.id ?? index}
                    className="border-b-[1px] border-b-solid border-b-lightGreyColor"
                  >
                    {/* S.No. */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                      {serialNo}
                    </td>

                    {/* Name */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                      {data?.user?.fullName}
                    </td>

                    {/* License */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                      {data?.user?.licenseNo}
                    </td>

                    {/* Gender */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap capitalize">
                      {data?.user?.gender}
                    </td>

                    {/* Email */}
                    <td className="px-2 py-3 align-middle">
                      <span className="block max-w-[260px] truncate lowercase" title={data?.email}>
                        {data?.email}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap capitalize">
                      {data?.user?.status}
                    </td>

                    {/* Clients (keep table aligned: allow wrapping inside cell, not horizontal scroll) */}
                    <td className="px-2 py-3 align-middle">
                      {data?.clientList === undefined ||
                      data?.clientList?.filter((p: Client) => p?.client?.clientShowToOthers === true)
                        .length === 0 ? (
                        <p className="whitespace-nowrap">No Clients</p>
                      ) : (
                        <div className="min-w-0">
                          {data?.clientList
                            .filter((client: Client) => client?.client?.clientShowToOthers === true)
                            .slice(0, 2)
                            .map((client: Client, idx) => (
                              <p
                                className="capitalize truncate max-w-[220px]"
                                title={client?.client?.user?.fullName}
                                key={idx}
                              >
                                {client?.client?.user?.fullName}
                              </p>
                            ))}

                          {data?.clientList.filter((p: Client) => p?.client?.clientShowToOthers === true)
                            .length > 2 && (
                            <p
                              className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark whitespace-nowrap"
                              onClick={() => navigate(`/providers/${data?.id}`)}
                            >
                              ... View All
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action (fixed padding + centered icon) */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <Link to={`/providers/${data?.id}`}>
                          <ViewIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>

            <CustomPagination
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hookCurrentPage={currentPage}
            />
          </>
        )}
      </div>
    </OutletLayout>
  );
};

export default Providers;
