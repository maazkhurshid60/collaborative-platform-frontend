
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../../components/icons/back/Back'
import { useNavigate, useParams } from 'react-router-dom'
import LabelData from '../../../../components/labelText/LabelData'
import UserIcon from '../../../../components/icons/user/User'
import Loader from '../../../../components/loader/Loader'
import { useQuery } from '@tanstack/react-query'
import { ClientType, Provider } from '../../../../types/clientType/ClientType'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import { GoDotFill } from 'react-icons/go'
import { getCountryNameFromCode } from '../../../../utils/GetCountryName'

const ClientProfile = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const loginUser = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const [selectedClientData, setSelectedClientData] = useState<ClientType>()

    // Fetch specifically the one client by ID (or filter if necessary)
    const { data: clients, isLoading, isError } = useQuery<ClientType[]>({
        queryKey: ["clients", loginUser?.user?.id],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUser?.user?.id);
                return response?.data?.clients || [];
            } catch (error) {
                console.error("Error fetching clients:", error);
                return [];
            }
        }
    })

    useEffect(() => {
        if (clients) {
            const selected = clients.find(data => data?.id === id)
            setSelectedClientData(selected)
        }
    }, [clients, id])

    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>Something went wrong</p>
    }

    const isSuperAdmin = loginUser?.user?.role === "superAdmin";
    const isCreator = (selectedClientData?.createdByProviderId === loginUser?.id) || (selectedClientData?.createdByProviderId === loginUser?.user?.id);
    const canEdit = isSuperAdmin || isCreator;

    return (
        <OutletLayout
            heading='Client profile'
            backButton={<BackIcon onClick={() => navigate(-1)} />}
            isEdit={canEdit}
            onEditClick={() => navigate(`/clients/edit-client/${id}`)}
        >
            <div className='mt-6'>
                <div>
                    <LabelData label='Client Image' />
                    {selectedClientData?.user?.profileImage ? (
                        <img
                            src={selectedClientData?.user?.profileImage}
                            alt="Client Image"
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                    ) : (
                        <UserIcon className='text-6xl mt-2' />
                    )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                    <div>
                        <LabelData label='Full Name' data={selectedClientData?.user?.fullName} />
                    </div>
                    <div>
                        <LabelData label='Client ID' data={selectedClientData?.clientId ?? '-'} />
                    </div>
                    <div>
                        <LabelData label='Age' data={selectedClientData?.user?.age ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Email' data={selectedClientData?.user?.email ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Contact Number' data={selectedClientData?.user?.contactNo ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Gender' data={selectedClientData?.user?.gender ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Address' data={selectedClientData?.user?.address ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Country' data={getCountryNameFromCode(selectedClientData?.user?.country ?? "") ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='State' data={selectedClientData?.user?.state ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Status' data={selectedClientData?.user?.status ?? "-"} />
                    </div>
                    <div>
                        <LabelData label='Account Created By Client' data={selectedClientData?.isAccountCreatedByOwnClient ? "Yes" : "No"} />
                    </div>
                    <div>
                        <LabelData label='Visible To Other Providers' data={selectedClientData?.clientShowToOthers ? "Yes" : "No"} />
                    </div>

                    <div className=' '>
                        <LabelData label='List of Providers' />
                        {selectedClientData?.providerList === undefined || selectedClientData?.providerList?.length === 0 ? (
                            <p className='text-[14px] py-0.5 font-medium text-textGreyColor'>No Providers</p>
                        ) : (
                            selectedClientData?.providerList.map((provider: Provider, index) => (
                                <p
                                    className='flex items-center gap-x-1 capitalize text-[14px] py-0.5 font-medium text-textGreyColor'
                                    key={index}
                                >
                                    <GoDotFill className='text-[6px]' />
                                    {provider?.provider?.user?.fullName}
                                </p>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </OutletLayout>
    )
}

export default ClientProfile
