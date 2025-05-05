import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import CardDashboardLayout from '../../../layouts/dashboardLayout/CardDashboardLayout'
import Collaboration from '../../../components/pagesComponent/dashboard/collaboration/Collaboration'

import { PiUsers } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import ClientList from '../../../components/pagesComponent/dashboard/clientList/ClientList';
import ProviderList from '../../../components/pagesComponent/dashboard/providerList/ProviderList';
import { useQuery } from '@tanstack/react-query';
import providerApiService from '../../../apiServices/providerApi/ProviderApi';
import Loader from '../../../components/loader/Loader';
import { useEffect, useState } from 'react';
import clientApiService from '../../../apiServices/clientApi/ClientApi';


const Dashboard = () => {



    const [cardData, setCardData] = useState([
        { icon: PiUsers, heading: "Total Users", numbers: 200 },
        { icon: PiUsers, heading: "Clients", numbers: 1034, isLoading: true, error: "" },
        { icon: TbUsersPlus, heading: "Providers", numbers: 1024, isLoading: true, error: "" },
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
        queryKey: ['totalclients'],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllTotalClient();
                return response?.data?.totalDocument || 0; // Ensure it always returns an array
            } catch (error) {
                console.error("Error fetching providers:", error);
                return [];
            }
        }
    })



    useEffect(() => {
        setCardData((prev) =>
            prev.map((item) => {
                if (item.heading === "Providers") {
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
        <OutletLayout heading='Dashboard'>


            <div className='flex flex-col gap-3'>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">



                    {cardData?.map((data, id: number) => {
                        const Icon = data?.icon
                        return (
                            <div className=" h-[120px] " key={id}>
                                <CardDashboardLayout>
                                    {data.isLoading && <Loader text="Loading..." />}
                                    <div key={id} className=''>
                                        <div className='flex items-center gap-x-3 font-[Montserrat] font-semibold text-textGreyColor'>
                                            <Icon size={30} className='text-primaryColorDark' />
                                            <p>{data?.heading}</p>
                                        </div>
                                        <p className='font-[Poppins] font-semibold text-textColor text-[32px] mt-3'>{data?.numbers}</p>
                                    </div>
                                </CardDashboardLayout>
                            </div>
                        )
                    })}



                </div>


                <div className='flex flex-col gap-3 lg:gap-0 lg:flex-row items-start justify-between flex-wrap'>
                    <div className=' flex flex-col gap-3 flex-wrap w-[100%] lg:w-[68%] '>
                        <div className='h-[390px] w-[100%] lg:w-[100%] overflow-auto'>
                            <CardDashboardLayout heading='Clients List'>
                                <ClientList />
                            </CardDashboardLayout>
                        </div>
                        <div className='h-[390px] w-[100%] lg:w-[100%] overflow-auto'>
                            <CardDashboardLayout heading='Providers List'>
                                <ProviderList />

                            </CardDashboardLayout>
                        </div>
                    </div>
                    <div className='w-[100%] lg:w-[31%] h-[792px]'>
                        <CardDashboardLayout heading='Collaborations'>
                            <Collaboration />
                        </CardDashboardLayout>
                    </div>
                </div>

            </div>
        </OutletLayout>
    )
}

export default Dashboard