import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EditClientetails from '../editClientDetail/EditClientDetail'
import ShareClientDoc from '../shareClientDoc/ShareClientDoc'
import BackIcon from '../../../icons/back/Back'
import { useQuery } from '@tanstack/react-query'
import { ClientType } from '../../../../types/clientType/ClientType'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { RootState } from '../../../../redux/store'
import { useSelector } from 'react-redux'
import Loader from '../../../loader/Loader'


const EditClient = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(0)
    const tabData = ["Details", "Documents"]
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.id)

    const [selectedClientData, setSelectedClientData] = useState<ClientType>()
    //FETCH ALL CLIENTS
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

    useEffect(() => {
        if (clientData && id) {
            const selected = clientData.find(data => data?.id === id);
            setSelectedClientData(selected);
        }
    }, [clientData, id])

    if (!id) {
        return <p>Invalid client ID</p>;
    }

    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (
        <OutletLayout heading='Client Profile'>
            <div className='relative'>
                <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>
                    <div className='relative group'>

                        <BackIcon onClick={() => navigate(-1)} />
                    </div>
                </div>
            </div>
            <div className='flex items-center mt-4 md:w-[60%] lg:w-[50%] xl:w-[30%] mb-3'>
                {tabData.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2  cursor-pointer text-center transition-colors duration-300 ${activeTab === id ? 'bg-primaryColorDark text-white rounded-md px-6 py-2 font-medium' : 'font-normal'
                            }`}
                        onClick={() => setActiveTab(id)}
                    >
                        {tab}
                    </p>
                ))}
            </div>
            <div className='relative'>
                {/* <div className='relative w-[15%] '>
                    <hr className='text-textGreyColor/20 h-[2px] w-[100%] mt-2' />
                    <hr
                        className={`text-primaryColorDark h-[2px] w-1/2 mt-2 absolute -top-2 
                        transition-all duration-300 ease-in-out 
                        ${activeTab === 0 ? 'left-0' : 'left-1/2'}`}
                    />
                </div> */}
                <hr className='text-textGreyColor/30 h-[2px] w-[100%] mt-0 absolute -top-[0px]' />
            </div>

            {activeTab === 0 ? <EditClientetails clientData={selectedClientData} /> : <ShareClientDoc clientId={id} recipientId={selectedClientData?.userId} clientEmail={selectedClientData?.email} />}
        </OutletLayout>
    )
}

export default EditClient