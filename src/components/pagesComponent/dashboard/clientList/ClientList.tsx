;
import Table from '../../../table/Table'
import CustomPagination from '../../../customPagination/CustomPagination'
import usePaginationHook from '../../../../hook/usePaginationHook'
import { useState } from 'react';
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

const ClientList = () => {
    const heading = ["name", "CNIC", "gender", "email", "status", "providers", "action"]


    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.id)
    const isModalDelete = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUserId);

                return response?.data?.clients; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await clientApiService.deleteClientApi(id);
        },
        onMutate: () => {
            setIsLoader(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['totalclients'] });
            toast.success("Account has deleted successfully")

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to update the client!');
            setIsLoader(false)
        },

    });
    console.log("clientdaata", clientData);


    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: clientData ?? [], recordPerPage: 4 })

    const handleDeleteFun = (id: string) => {
        dispatch(isModalDeleteReducer(true))
        setSelectedClientId(id)
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
            {isModalDelete && selectedClientId && <DeleteClientModal onDeleteConfirm={handleDeleteConfirm} />}
            <Table heading={heading} >
                {getCurrentRecords()
                    ?.map((data: ClientType, id: number) => (

                        <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                            <td className="px-2 py-2">{data?.user?.fullName?.slice(0, 12) + "..."}</td>
                            <td className="px-2 py-2">{data?.user?.cnic?.slice(0, 12) + "..."}</td>
                            <td className="px-2 py-2">{data?.user?.gender}</td>
                            <td className="px-2 py-2 lowercase">{data?.email?.slice(0, 12) + "..."}</td>
                            <td className="px-2 py-2">{data?.user?.status}</td>
                            <td className="px-2 py-2 w-[100px] ">
                                {data?.providerList?.length === 0 || data?.providerList === undefined
                                    ? <p>No Providers</p>
                                    : data?.providerList.map((provider: Provider, index) => (
                                        <p className='flex items-center gap-x-1  capitalize' key={index}>
                                            {provider?.provider?.user?.fullName?.slice(0, 12) + "..."}

                                        </p>
                                    ))
                                }

                            </td>

                            <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                {data?.providerList?.length !== 0 || data?.providerList !== undefined
                                    &&
                                    data.providerList.some((provider: ProviderType) => provider?.user?.id === loginUserId) ? (
                                    <>
                                        <EditIcon onClick={() => { navigate(`/clients/edit-client/${data?.id}`) }} />{/* update those client which are present in logined provider list */}
                                        <DeleteIcon onClick={() => handleDeleteFun(data?.userId ?? "")} />{/* delete those client which are present in logined provider list */}
                                    </>
                                ) : (
                                    <>
                                        <EditIcon disable />
                                        <DeleteIcon disable />
                                    </>
                                )


                                }


                            </td>


                        </tr>
                    ))}
            </Table>
            <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
        </div>

    </>


    )
}

export default ClientList

