import Table from '../../../table/Table';
import CustomPagination from '../../../customPagination/CustomPagination';
import usePaginationHook from '../../../../hook/usePaginationHook';
import { useQuery } from '@tanstack/react-query';
import { Client, ProviderType } from '../../../../types/providerType/ProviderType';
import providerApiService from '../../../../apiServices/providerApi/ProviderApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import Loader from '../../../loader/Loader';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

const ProviderList = () => {
  const heading = ["#", "name", "license No", "email", "status", "speciality", "clients"];
  const loginUserDetail = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id
  );

  const navigate = useNavigate();

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

  const filteredData = useMemo(() => {
    return providerData?.filter(p => !p?.user?.blockedMembers?.includes(loginUserDetail)) || [];
  }, [providerData, loginUserDetail]);

  // Keep recordPerPage as a constant so we can use it in S.No formula
  const recordPerPage = 4;

  const {
    totalPages,
    getCurrentRecords,
    handlePageChange,
    currentPage,
  } = usePaginationHook({ data: filteredData, recordPerPage });

  const currentRecords = getCurrentRecords() ?? [];

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>somethingwent wrong</p>;

  return (
    <>
      <div className="mt-2">
        {currentRecords.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {currentRecords.map((data: ProviderType, index: number) => {
                const serialNo = (currentPage - 1) * recordPerPage + index + 1;

                return (
                  <tr
                    key={data?.id ?? serialNo}
                    className="border-b border-b-solid border-b-lightGreyColor pb-4s"
                  >
                    <td className="px-2 py-4 w-[60px] whitespace-nowrap">{serialNo}</td>
                    <td className="px-2 py-4">{data?.user?.fullName}</td>
                    <td className="px-2 py-4">{data?.user?.licenseNo}</td>
                    <td className="px-2 py-4 lowercase">{data?.user?.email}</td>
                    {data?.user?.status === "active" ? (
                      <td className="px-2 py-4 capitalize text-primaryColorDark">{data?.user?.status}</td>
                    ) : (
                      <td className="px-2 py-4 capitalize text-red-500">{data?.user?.status}</td>
                    )}

                    <td className="px-2 py-4 capitalize">{data?.speciality}</td>

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
    </>
  );
};

export default ProviderList;
