import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(0)
    const tabData = ["Details", "Documents"]
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.id)
    const providerId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)

    const [selectedClientData, setSelectedClientData] = useState<ClientType>()

    //FETCH ALL CLIENTS
    const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUserId);
                return response?.data?.clients || [];
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

    const isCreatorOrSuperAdmin = String(selectedClientData?.createdByProviderId) === String(providerId) ||
        String(selectedClientData?.userId) === String(loginUserId);

    useEffect(() => {
        if (location.state?.view === 'documents') {
            setActiveTab(1);
        }
    }, [location.state]);

    const canEditDetails = isCreatorOrSuperAdmin;

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
        <OutletLayout heading='Client Profile' backButton={<BackIcon onClick={() => navigate(-1)} />}>

            {/* Only show tabs if user has permission to view details (isCreator) */}
            {canEditDetails && (
                <>
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
                        <hr className='text-textGreyColor/30 h-[2px] w-[100%] mt-0 absolute -top-[0px]' />
                    </div>
                </>
            )}

            {
                // If canEditDetails is false, we ALWAYS show ShareClientDoc (effectively tab 1).
                // If canEditDetails is true, we show based on activeTab.
                (!canEditDetails || activeTab === 1) ?
                    <ShareClientDoc clientId={id} recipientId={selectedClientData?.userId} clientEmail={selectedClientData?.user?.email} />
                    :
                    <EditClientetails clientData={selectedClientData} />
            }
        </OutletLayout>
    )
}

export default EditClient