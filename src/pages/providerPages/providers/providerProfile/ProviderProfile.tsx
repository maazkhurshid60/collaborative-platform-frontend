
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
import { localhostBaseUrl } from '../../../../apiServices/baseUrl/BaseUrl'

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

    const imagePath = `${localhostBaseUrl}uploads/eSignatures/${selectedProviderData?.user?.profileImage?.split('/').pop()}`


    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        console.log(isError);

        return <p>somethingwent wrong</p>
    }
    return (
        <OutletLayout heading='Provider profile'>
            <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>

                    <BackIcon onClick={() => navigate("/providers")} />
                </div>
            </div>
            <div className='mt-6'>
                <div>
                    <LabelData label='Provider Image' />
                    {(selectedProviderData?.user?.profileImage !== null && selectedProviderData?.user?.profileImage !== "null") ? <img
                        src={imagePath}
                        alt="Client"
                        className="w-20 h-20 rounded-full object-cover"
                    /> : <UserIcon className='text-6xl mt-2' />}

                </div>

                {/* <div className='flex items-center justify-between flex-wrap gap-y-10 mt-10'> */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                    <div className=''>
                        <LabelData label='Full Name' data={selectedProviderData?.user?.fullName} />
                    </div>
                    <div className=''>
                        <LabelData label='CNIC Number' data={selectedProviderData?.user?.cnic} />
                    </div>
                    <div className=''>
                        <LabelData label='Age' data={selectedProviderData?.user?.age ?? ""} />
                    </div>
                    <div className=''>
                        <LabelData label='Email' data={selectedProviderData?.email ?? ""} />
                    </div>
                    <div className=''>
                        <LabelData label='Contact No' data={selectedProviderData?.user?.contactNo ?? ""} />
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