import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import CardDashboardLayout from '../../../layouts/dashboardLayout/CardDashboardLayout'
import Collaboration from '../../../components/pagesComponent/dashboard/collaboration/Collaboration'
import ClientList from '../../../components/pagesComponent/dashboard/clientList/ClientList';
import ProviderList from '../../../components/pagesComponent/dashboard/providerList/ProviderList';
import TrialBanner from '../../../components/pagesComponent/dashboard/trialBanner/TrialBanner';
import { useQuery } from '@tanstack/react-query';
import providerApiService from '../../../apiServices/providerApi/ProviderApi';
import { useEffect, useState } from 'react';
import clientApiService from '../../../apiServices/clientApi/ClientApi';
import { ClientType } from '../../../types/clientType/ClientType';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import ClientsIcon from '../../../components/icons/dashboardIcons/providersPortalIcons/clients/Clients';
import ProvidersIcon from '../../../components/icons/dashboardIcons/providersPortalIcons/providers/Providers';
import SubscriptionHistoryCard from '../../../components/pagesComponent/dashboard/subscriptionHistory/SubscriptionHistoryCard';


const Dashboard = () => {
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const [cardData, setCardData] = useState([
        { icon: ClientsIcon, heading: "Total Users", numbers: 200 },
        { icon: ClientsIcon, heading: "Clients", numbers: 1034, isLoading: true, error: "" },
        { icon: ProvidersIcon, heading: "Providers on the plateform", numbers: 1024, isLoading: true, error: "" },
    ])
    // Fetch total provider using React Query
    const { data: totalNoOfProvider = 0, isLoading: isLoadingProviders, isError: isErrorProviders } = useQuery<number>({
        queryKey: ['totalproviders'],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllTotalProviders();
                return response?.data?.totalDocument || 0; // Ensure it always returns an array
            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }
    });

    const { data: totalNoOfClient = 0, isLoading: isLoadingClients, isError: isErrorClients } = useQuery<number>({
        queryKey: ['totalclients', loginUserId],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllClient(loginUserId);
                const matchedClient = response?.data?.clients?.filter((client: ClientType) =>
                    client?.providerList?.some(provider => provider?.provider?.user?.id === loginUserId)
                );
                return matchedClient?.length ?? 0;
            } catch (error) {
                console.error("Error fetching clients:", error);
                return 0;
            }
        },
        enabled: Boolean(loginUserId),
    })

    useEffect(() => {
        setCardData((prev) =>
            prev.map((item) => {
                if (item.heading === "Providers on the plateform") {
                    return {
                        ...item,
                        numbers: totalNoOfProvider,
                        isLoading: isLoadingProviders,
                        error: isErrorProviders ? "Error loading providers" : "",
                    };
                } else if (item.heading === "Clients") {
                    return {
                        ...item,
                        numbers: totalNoOfClient,
                        isLoading: isLoadingClients,
                        error: isErrorClients ? "Error loading clients" : "",
                    };
                } else if (item.heading === "Total Users") {
                    return {
                        ...item,
                        numbers: totalNoOfClient + totalNoOfProvider,
                        isLoading: isLoadingClients || isLoadingProviders,
                        error:
                            isErrorClients || isErrorProviders
                                ? "Error loading total users"
                                : "",
                    };
                }
                return item;
            })
        );
    }, [
        totalNoOfProvider,
        totalNoOfClient,
        isLoadingClients,
        isLoadingProviders,
        isErrorClients,
        isErrorProviders,
    ]);

    return (
        <div className='flex flex-col w-full h-full p-3 overflow-y-auto rounded-lg pt-5 bg-white'>
            <TrialBanner />
            <OutletLayout heading='Dashboard'>
                <div className='flex flex-col gap-3'>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {cardData?.map((data, id: number) => {
                            const Icon = data?.icon
                            return (
                                <div className=" h-[120px] " key={id}>
                                    <CardDashboardLayout>
                                        {/* {data.isLoading && <Loader text="12232" />} */}
                                        <div key={id} className=''>
                                            <div className='flex items-center gap-x-3 font-[Montserrat] font-semibold text-textGreyColor'>
                                                <Icon className='text-primaryColorDark' />
                                                <p>{data?.heading}</p>
                                            </div>
                                            <p className='font-[Poppins] font-semibold text-textColor text-[32px] mt-3'>{data?.numbers}</p>
                                        </div>
                                    </CardDashboardLayout>
                                </div>
                            )
                        })}
                    </div>
                    <div className='flex flex-col gap-3 lg:gap-0 lg:flex-row items-start justify-evenly flex-wrap'>
                        <div className=' flex flex-col gap-2 flex-wrap w-full lg:w-[68%] '>
                            <div className=' w-full  max-h-screen lg:w-[98%] overflow-x-auto rounded-md'>
                                <CardDashboardLayout heading='Clients List'>
                                    <ClientList />
                                </CardDashboardLayout>
                            </div>
                            <div className='w-full lg:w-[98%] max-h-screen overflow-x-auto rounded-md'>
                                <CardDashboardLayout heading='Providers List'>
                                    <ProviderList />
                                </CardDashboardLayout>
                            </div>
                            <div className='w-full lg:w-[98%] max-h-screen overflow-x-auto rounded-md'>
                                <CardDashboardLayout heading='Subscription History'>
                                    <SubscriptionHistoryCard />
                                </CardDashboardLayout>
                            </div>
                        </div>
                        <div className='w-[110%] min-h-screen  lg:w-[31.5%] overflow-y-auto'>
                            <CardDashboardLayout heading='Conversations'>
                                <Collaboration />
                            </CardDashboardLayout>
                        </div>
                    </div>

                </div>
            </OutletLayout>
        </div>
    )
}

export default Dashboard