;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import Button from '../../../components/button/Button'

import usePaginationHook from '../../../hook/usePaginationHook';
import Table from '../../../components/table/Table';
import CustomPagination from '../../../components/customPagination/CustomPagination';
import EditIcon from '../../../components/icons/edit/Edit';
import DeleteIcon from '../../../components/icons/delete/DeleteIcon';
import { useNavigate } from 'react-router-dom';
import DeleteClientModal from '../../../components/modals/providerModal/deleteClientModal/DeleteClientModal';
import { useDispatch, useSelector } from 'react-redux';
import { isModalDeleteReducer } from '../../../redux/slices/ModalSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import Loader from '../../../components/loader/Loader';
import { toast } from 'react-toastify';
import clientApiService from '../../../apiServices/clientApi/ClientApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ClientType, Provider } from '../../../types/clientType/ClientType';
import { ProviderType } from '../../../types/providerType/ProviderType';
import { IoMdAdd } from "react-icons/io";
import NoRecordFound from '../../../components/noRecordFound/NoRecordFound';
export interface selectedClientIdType {
    clientId: string, providerId: string
}

const Clients = () => {
    const navigate = useNavigate()
    const heading = ["S.No", "name", "CNIC", "gender", "email", "status", "providers", "action"]
    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails)
    const isModalDelete = useSelector((state: RootState) => state?.modalSlice?.isModalDelete)
    const [selectedClientId, setSelectedClientId] = useState<selectedClientIdType>({ clientId: "", providerId: "" })
    // const [matchedClient, setMatchedClient] = useState()
    const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUserId?.user?.id);
                const matchedClient = response?.data?.clients?.filter((client: ClientType) =>
                    client?.providerList?.some(provider => provider?.provider?.user?.id === loginUserId?.user?.id)
                );

                return matchedClient; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
    // console.log("<<<<<<<<<<<<<<<<", clientData && clientData[0]?.providerList?.some((provider) => provider?.user?.id === loginUserId));

    // const matchedClient =
    //     clientData?.filter(client =>
    //         client?.providerList?.some(provider => provider?.provider?.user?.id === loginUserId)
    //     );

    console.log("Matched Client:", clientData);

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
            toast.success("Account has deleted successfully")

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to delete the department!');
            setIsLoader(false)
        },

    });


    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: clientData ?? [], recordPerPage: 6 })

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
    console.log("<<<<<<<<<<<<<<<", getCurrentRecords(), "loginuser", loginUserId);

    return (
        <OutletLayout heading='Client List' button={<Button text='Add New' onclick={() => navigate("add-client")} icon={<IoMdAdd />} />}>
            {isLoader && <Loader text='Deleting...' />}
            {isModalDelete && selectedClientId && <DeleteClientModal onDeleteConfirm={handleDeleteConfirm} text={<div>By Deleting this you account you won’t be able to track record of your signed Documents. Are you sure that you want to <span className='font-semibold'>Delete your Account</span>?</div>}
            />}
            <div className='mt-10 w-[100%]'>
                {getCurrentRecords()?.length === 0 ? <NoRecordFound /> : <>
                    <Table heading={heading} >
                        {getCurrentRecords()
                            .map((data: ClientType, id: number) => (

                                <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                                    <td className="px-2 py-2">{id + 1}</td>
                                    <td className="px-2 py-2">{data?.user?.fullName}</td>
                                    <td className="px-2 py-2">{data?.user?.cnic}</td>
                                    <td className="px-2 py-2">{data?.user?.gender}</td>
                                    <td className="px-2 py-2 lowercase">{data?.email}</td>
                                    <td className="px-2 py-2">{data?.user?.status}</td>
                                    <td className="px-2 py-2 w-[100px]">
                                        {data?.providerList?.length === 0 || data?.providerList === undefined
                                            ? <p>No Providers Found</p>
                                            : data?.providerList.map((providerList: Provider, index) => (
                                                <p className='flex items-center gap-x-1  capitalize' key={index}>
                                                    {providerList?.provider?.user?.fullName}

                                                </p>
                                            ))
                                        }

                                    </td>

                                    <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                        {data?.providerList?.length !== 0 || data?.providerList !== undefined
                                            &&
                                            data.providerList.some((provider: ProviderType) => provider?.user?.id === loginUserId?.user?.id) ? (
                                            <>
                                                <EditIcon onClick={() => { navigate(`/clients/edit-client/${data?.id}`) }} />{/* update those client which are present in logined provider list */}
                                                <DeleteIcon onClick={() => handleDeleteFun(data?.id ?? "", loginUserId?.id)} />{/* delete those client which are present in logined provider list */}
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
                </>}
            </div>
        </OutletLayout >)
}

export default Clients