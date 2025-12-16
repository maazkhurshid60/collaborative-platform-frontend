;
import Table from '../../../table/Table'
import CustomPagination from '../../../customPagination/CustomPagination'
import usePaginationHook from '../../../../hook/usePaginationHook'
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
import { ProviderType } from '../../../../types/providerType/ProviderType';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';
import { selectedClientIdType } from '../../../../pages/providerPages/clients/Clients';

const ClientList = () => {
    const heading = ["name", "license No", "gender", "email", "status", "providers", "action"]


    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails)
    const isModalDelete = useSelector((state: RootState) => state?.modalSlice?.isModalDelete)
    const [selectedClientId, setSelectedClientId] = useState<selectedClientIdType>({ clientId: "", providerId: "" })
    const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUserId?.user?.id);
                return response?.data?.clients || [];
            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
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

            toast.success("Account has deleted successfully")

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to update the client!');
            setIsLoader(false)
        },

    });

    const myClients = useMemo(() => {
        return clientData?.filter((client: ClientType) =>
            client?.providerList?.some(provider => provider?.provider?.user?.id === loginUserId?.user?.id)
        ) || [];
    }, [clientData, loginUserId?.user?.id]);

    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: myClients ?? [], recordPerPage: 4 })

    const handleDeleteFun = (id: string, loginUserId: string) => {
        dispatch(isModalDeleteReducer(true))
        setSelectedClientId({ clientId: id, providerId: loginUserId })
    }
    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedClientId);
        dispatch(isModalDeleteReducer(false))
    }


    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (<>
        <div className='mt-2'>
            {isLoader && <Loader text='Deleting...' />}
            {isModalDelete && selectedClientId && <DeleteClientModal onDeleteConfirm={handleDeleteConfirm} text={<div>By Deleting this you account you won’t be able to track record of your signed Documents. Are you sure that you want to <span className='font-semibold'>Delete your Account</span>?</div>}
            />}
            {getCurrentRecords()?.length === 0 ? <NoRecordFound /> : <>
                <Table heading={heading} >
                    {getCurrentRecords()
                        ?.map((data: ClientType, id: number) => (

                            <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                                <td className="px-2 py-4">{data?.user?.fullName}</td>
                                <td className="px-2 py-4">{data?.user?.licenseNo}</td>
                                <td className="px-2 py-4 capitalize">{data?.user?.gender}</td>
                                <td className="px-2 py-4 lowercase">{data?.email}</td>
                                <td className="px-2 py-4 capitalize">{data?.user?.status}</td>
                                <td className="px-2 py-2 w-[100px]">
                                    {

                                        data?.providerList?.length === 0 || data?.providerList === undefined
                                            ? <p>No Providers Found</p>
                                            :
                                            <>
                                                {data?.providerList
                                                    ?.slice()
                                                    ?.sort((a, b) => {
                                                        const isA = a?.provider?.user?.id === loginUserId?.user?.id;
                                                        const isB = b?.provider?.user?.id === loginUserId?.user?.id;
                                                        return isA === isB ? 0 : isA ? -1 : 1;
                                                    })
                                                    ?.slice(0, 2)
                                                    ?.map((providerItem: Provider, index) => {
                                                        return (
                                                            <p className={`flex items-center gap-x-1 capitalize `} key={index}>
                                                                {providerItem?.provider?.user?.fullName}
                                                            </p>
                                                        )
                                                    })}

                                                {data?.providerList?.length > 2 && (
                                                    <p className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark" onClick={() => { navigate(`/clients/edit-client/${data?.id}`) }}>... View All</p>
                                                )}
                                            </>
                                    }

                                </td>
                                <td className="py-4 h-full align-middle">
                                    <div className="flex items-center justify-center gap-x-2 h-full">
                                        {data?.providerList?.length !== 0 || data?.providerList !== undefined
                                            && data.providerList.some((provider: ProviderType) => provider?.user?.id === loginUserId?.user?.id) ? (
                                            <>
                                                <EditIcon onClick={() => { navigate(`/clients/edit-client/${data?.id}`) }} />
                                                <DeleteIcon onClick={() => handleDeleteFun(data?.id ?? "", loginUserId?.id)} />
                                            </>
                                        ) : (
                                            <>
                                                <EditIcon disabled />
                                                <DeleteIcon disabled />
                                            </>
                                        )
                                        }
                                    </div>
                                </td>



                            </tr>
                        ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} /></>}

        </div>

    </>


    )
}

export default ClientList

