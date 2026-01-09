import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import Button from '../../../components/button/Button';

import usePaginationHook from '../../../hook/usePaginationHook';
import Table from '../../../components/table/Table';
import CustomPagination from '../../../components/customPagination/CustomPagination';

import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../../components/loader/Loader';
import providerApiService from '../../../apiServices/providerApi/ProviderApi';
import { useQuery } from '@tanstack/react-query';
import { Client, ProviderType } from '../../../types/providerType/ProviderType';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ViewIcon from '../../../components/icons/view/View';
import NoRecordFound from '../../../components/noRecordFound/NoRecordFound';
import { useMemo, useState } from 'react';
import { filterProviders } from '../../../utils/FilteredUsers';
import SearchBar from '../../../components/searchBar/SearchBar';

const Providers = () => {
  // 1) Add "S.No." in heading as the first column
  const heading = ["S.No.", "name", "license number", "gender", "email", "status", "clients", "action"];

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

  // Keep recordPerPage in a constant so S.No. stays correct
  const recordPerPage = 6;

  const {
    totalPages,
    getCurrentRecords,
    handlePageChange,
    currentPage,
  } = usePaginationHook({ data: providerData ?? [], recordPerPage });

  // Current page data (from pagination)
  const currentRecords = getCurrentRecords() ?? [];

  // Filter out blocked members (current page only, consistent with your original approach)
  const filteredData = useMemo(() => {
    return currentRecords.filter((p) => !p?.user?.blockedMembers?.includes(loginUserDetail));
  }, [currentRecords, loginUserDetail]);

  // Apply search filter
  const filteredSearchProviders = useMemo(() => {
    return filterProviders(filteredData || [], searchTerm);
  }, [filteredData, searchTerm]);

  const downloadXLS = (data: ProviderType[], fileName: string = "providers.xls") => {
    // Optional: include S.No. in excel too (page-based)
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
                // 2) S.No. calculation with pagination offset
                const serialNo = (currentPage - 1) * recordPerPage + index + 1;

                return (
                  <tr
                    key={data?.id ?? index}
                    className="border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s"
                  >
                    {/* S.No. column */}
                    <td className="px-2 py-4">{serialNo}</td>

                    <td className="px-2 py-4">{data?.user?.fullName}</td>
                    <td className="px-2 py-4">{data?.user?.licenseNo}</td>
                    <td className="px-2 py-4 capitalize">{data?.user?.gender}</td>
                    <td className="px-2 py-4 lowercase">{data?.email}</td>
                    <td className="px-2 py-4 capitalize">{data?.user?.status}</td>

                    <td className="px-2 py-4 w-[100px]">
                      {data?.clientList === undefined ||
                      data?.clientList?.filter((p: Client) => p?.client?.clientShowToOthers === true)
                        .length === 0 ? (
                        <p>No Clients</p>
                      ) : (
                        <>
                          {data?.clientList
                            .filter((client: Client) => client?.client?.clientShowToOthers === true)
                            .slice(0, 2)
                            .map((client: Client, idx) => (
                              <p className="flex items-center gap-x-1 capitalize whitespace-nowrap" key={idx}>
                                {client?.client?.user?.fullName}
                              </p>
                            ))}

                          {data?.clientList.filter((p: Client) => p?.client?.clientShowToOthers === true)
                            .length > 2 && (
                            <p
                              className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark"
                              onClick={() => navigate(`/providers/${data?.id}`)}
                            >
                              ... View All
                            </p>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-2 h-full w-[80px] align-middle">
                      <div className="flex items-center justify-center h-full">
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
