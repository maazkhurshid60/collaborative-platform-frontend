import Table from '../../../table/Table';
import CustomPagination from '../../../customPagination/CustomPagination';
import usePaginationHook from '../../../../hook/usePaginationHook';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientApiService from '../../../../apiServices/clientApi/ClientApi';
import { ClientType, Provider } from '../../../../types/clientType/ClientType';
import Loader from '../../../loader/Loader';
import DeleteClientModal from '../../../modals/providerModal/deleteClientModal/DeleteClientModal';
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import EditIcon from '../../../icons/edit/Edit';
import DeleteIcon from '../../../icons/delete/DeleteIcon';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';
import { selectedClientIdType } from '../../../../pages/providerPages/clients/Clients';
import ViewIcon from '../../../icons/view/View';

const ClientList = () => {
  // 1) Add S.No. as first heading
  const heading = ["S.No.", "name", "license No", "gender", "email", "status", "providers", "action"];

  const [isLoader, setIsLoader] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails);
  const isModalDelete = useSelector((state: RootState) => state?.modalSlice?.isModalDelete);

  const [selectedClientId, setSelectedClientId] = useState<selectedClientIdType>({
    clientId: "",
    providerId: "",
  });

  const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
    queryKey: ["clients", loginUserId?.user?.id],
    queryFn: async () => {
      try {
        const response = await clientApiService.getAllClient(loginUserId?.user?.id);
        return response?.data?.clients || [];
      } catch (error) {
        console.error("Error fetching client:", error);
        return [];
      }
    },
    enabled: Boolean(loginUserId?.user?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: selectedClientIdType) => {
      await clientApiService.deleteClientApi(id);
    },
    onMutate: () => {
      setIsLoader(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['totalclients'] });
      queryClient.invalidateQueries({ queryKey: ['allclients'] });

      toast.success("Account has deleted successfully");
      setIsLoader(false);
    },
    onError: () => {
      toast.error('Failed to update the client!');
      setIsLoader(false);
    },
  });

  const myClients = useMemo(() => {
    return (
      clientData?.filter((client: ClientType) =>
        client?.providerList?.some((provider) => provider?.provider?.user?.id === loginUserId?.user?.id)
      ) || []
    );
  }, [clientData, loginUserId?.user?.id]);

  // Keep this as a constant so S.No. stays correct
  const recordPerPage = 4;

  const {
    totalPages,
    getCurrentRecords,
    handlePageChange,
    currentPage,
  } = usePaginationHook({ data: myClients ?? [], recordPerPage });

  const handleDeleteFun = (id: string, providerId: string) => {
    dispatch(isModalDeleteReducer(true));
    setSelectedClientId({ clientId: id, providerId });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(selectedClientId);
    dispatch(isModalDeleteReducer(false));
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>somethingwent wrong</p>;

  const currentRecords = getCurrentRecords() ?? [];

  return (
    <>
      <div className="mt-2">
        {isLoader && <Loader text="Deleting..." />}

        {isModalDelete && selectedClientId && (
          <DeleteClientModal
            onDeleteConfirm={handleDeleteConfirm}
            text={
              <div>
                By Deleting this you account you won’t be able to track record of your signed Documents.
                Are you sure that you want to <span className="font-semibold">Delete your Account</span>?
              </div>
            }
          />
        )}

        {currentRecords.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            {/* If your Table component supports horizontal scrolling on small screens, keep it there.
               Otherwise, you can wrap Table with: <div className="w-full overflow-x-auto"> ... </div> */}
            <Table heading={heading}>
              {currentRecords.map((data: ClientType, index: number) => {
                // 2) Serial number across pages
                const serialNo = (currentPage - 1) * recordPerPage + index + 1;

                return (
                  <tr
                    key={data?.id ?? index}
                    className="border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s"
                  >
                    {/* S.No. column */}
                    <td className="px-2 py-4 w-[60px] whitespace-nowrap">{serialNo}</td>

                    <td className="px-2 py-4">{data?.user?.fullName}</td>
                    <td className="px-2 py-4">{data?.user?.licenseNo}</td>
                    <td className="px-2 py-4 capitalize">{data?.user?.gender}</td>
                    <td className="px-2 py-4 lowercase">{data?.user?.email}</td>
                    <td className="px-2 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${data?.user?.status?.toLowerCase() === 'active' ? ' text-primaryColorDark' : 'bg-red-100 text-red-800'}`}>
                        {data?.user?.status?.toLowerCase()}
                      </span>
                    </td>

                    <td className="px-2 py-2 w-[100px]">
                      {data?.providerList?.length === 0 || data?.providerList === undefined ? (
                        <p>No Providers Found</p>
                      ) : (
                        <>
                          {data?.providerList
                            ?.slice()
                            ?.sort((a, b) => {
                              const isA = a?.provider?.user?.id === loginUserId?.user?.id;
                              const isB = b?.provider?.user?.id === loginUserId?.user?.id;
                              return isA === isB ? 0 : isA ? -1 : 1;
                            })
                            ?.slice(0, 2)
                            ?.map((providerItem: Provider, idx) => (
                              <p className="flex items-center gap-x-1 capitalize" key={idx}>
                                {providerItem?.provider?.user?.fullName}
                              </p>
                            ))}

                          {data?.providerList?.length > 2 && (
                            <p
                              className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark"
                              onClick={() => navigate(`/clients/edit-client/${data?.id}`)}
                            >
                              ... View All
                            </p>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-4 h-full align-middle">
                      <div className="flex items-center justify-center gap-x-2 h-full">
                        {(
                          (data?.providerList?.length ?? 0) !== 0 &&
                          data?.providerList?.some(
                            (provider: any) => provider?.provider?.user?.id === loginUserId?.user?.id
                          )
                        ) ? (
                          <>
                            <ViewIcon onClick={() => navigate(`/clients/${data?.id}`)} />
                            {(data?.createdByProviderId === loginUserId?.user?.id ||
                              data?.createdByProviderId === loginUserId?.id ||
                              loginUserId?.user?.role === "superAdmin") && (
                                <EditIcon onClick={() => navigate(`/clients/edit-client/${data?.id}`)} />
                              )}
                            <DeleteIcon onClick={() => handleDeleteFun(data?.id ?? "", loginUserId?.user?.id)} />
                          </>
                        ) : (
                          <>
                            <ViewIcon onClick={() => navigate(`/clients/${data?.id}`)} />
                          </>
                        )}
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
    </>
  );
};

export default ClientList;
