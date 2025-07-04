
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../../components/icons/back/Back'
import { useNavigate, useParams } from 'react-router-dom'
import LabelData from '../../../../components/labelText/LabelData'
import UserIcon from '../../../../components/icons/user/User'
import Loader from '../../../../components/loader/Loader'
import { useQuery } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import { GoDotFill } from 'react-icons/go'

const ProviderProfile = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.id)
    const [selectedProviderData, setSelectedProviderData] = useState<ProviderType>()
    //FETCH ALL PROVIDERS
    const { data: providerData, isLoading, isError } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllProviders(loginUserId);
                return response?.data?.providers; // Ensure it always returns an array

            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })


    useEffect(() => {
        setSelectedProviderData(providerData?.find(data => data?.id === id));

    }, [])

    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (
        <OutletLayout heading='Provider profile'>
            <div className='relative'>
                <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>

                    <BackIcon onClick={() => navigate(-1)} />
                </div>
            </div>
            <div className='mt-6'>
                <div>
                    <LabelData label='Provider Image' />
                    {(selectedProviderData?.user?.profileImage !== null && selectedProviderData?.user?.profileImage !== "null") ? <img
                        src={selectedProviderData?.user?.profileImage}
                        alt="Client"
                        className="w-20 h-20 rounded-lg object-cover"
                    /> : <UserIcon className='text-6xl mt-2' />}

                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                    <div className=''>
                        <LabelData label='Full Name' data={selectedProviderData?.user?.fullName} />
                    </div>
                    <div className=''>
                        <LabelData label='License Number' data={selectedProviderData?.user?.licenseNo} />
                    </div>
                    <div className=''>
                        <LabelData label='Age' data={selectedProviderData?.user?.age ?? ""} />
                    </div>
                    <div className=''>
                        <LabelData label='Email' data={selectedProviderData?.email ?? ""} />
                    </div>
                    <div className=''>
                        <LabelData label='Contact Number' data={selectedProviderData?.user?.contactNo ?? ""} />
                    </div>
                    <div className=''>
                        <LabelData label='Address' data={selectedProviderData?.user?.address ?? ""} />
                    </div>
                    <div className=' '>
                        <LabelData label='List of Active Clients' />



                        {selectedProviderData?.clientList?.length === 0 || selectedProviderData?.clientList === undefined
                            ? <p className='text-[14px]  py-0.5  font-medium text-textGreyColor'>No Clients</p>
                            : selectedProviderData?.clientList.map((provider: ProviderType, index) => (
                                <p className='flex items-center gap-x-1  capitalize text-[14px]  py-0.5  font-medium text-textGreyColor' key={index}>
                                    <GoDotFill className='text-[6px]' />     {provider?.client?.user?.fullName}

                                </p>
                            ))
                        }

                    </div>
                </div>
            </div>
        </OutletLayout>
    )
}

export default ProviderProfile