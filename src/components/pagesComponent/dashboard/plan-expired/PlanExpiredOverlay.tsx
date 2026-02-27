import React, { useEffect, useState } from 'react';
import { Lock, Shield, CreditCard, Users, LayoutDashboard, Briefcase, History, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout';
import CardDashboardLayout from '../../../../layouts/dashboardLayout/CardDashboardLayout';
import Collaboration from '../../../pagesComponent/dashboard/collaboration/Collaboration';
import ClientList from '../../../pagesComponent/dashboard/clientList/ClientList';
import ProviderList from '../../../pagesComponent/dashboard/providerList/ProviderList';
import TrialBanner from '../../../pagesComponent/dashboard/trialBanner/TrialBanner';
import { useQuery } from '@tanstack/react-query';
import providerApiService from '../../../../apiServices/providerApi/ProviderApi';
import clientApiService from '../../../../apiServices/clientApi/ClientApi';
import { ClientType } from '../../../../types/clientType/ClientType';
import { RootState } from '../../../../redux/store';
import ClientsIcon from '../../../../components/icons/dashboardIcons/providersPortalIcons/clients/Clients';
import ProvidersIcon from '../../../../components/icons/dashboardIcons/providersPortalIcons/providers/Providers';
import SubscriptionHistoryCard from '../../../pagesComponent/dashboard/subscriptionHistory/SubscriptionHistoryCard';

// Industrial Premium Locked Overlay
const LockedSection: React.FC<{ children: React.ReactNode; label?: string; showButton?: boolean }> = ({ children, label, showButton = true }) => {
    const navigate = useNavigate();
    return (
        <div className="relative group overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] transition-all duration-300 h-full w-full">
            {/* The actual content (blurred) */}
            <div className="blur-[6px] opacity-25 select-none pointer-events-none transition-all duration-500 w-full h-full scale-[0.99] group-hover:scale-100">
                {children}
            </div>

            {/* Professional Industrial Overlay */}
            <div className="absolute inset-0 z-10 bg-slate-50/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-t-2 border-transparent group-hover:border-primaryColor">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white shadow-md rounded-full flex items-center justify-center border border-[#E5E7EB] mb-4">
                        <Lock size={24} className="text-primaryColorDark" />
                    </div>

                    {label && <h3 className="text-[17px] font-bold text-[#111827] font-[Montserrat] mb-2 tracking-tight">{label}</h3>}

                    {showButton && (
                        <button
                            onClick={() => navigate('/select-plan')}
                            className="bg-primaryColorDark text-white px-7 py-2.5 rounded-lg text-[14px] font-bold font-[Poppins] hover:bg-[#0B786B] transition-all shadow-md active:shadow-inner cursor-pointer"
                        >
                            View Subscription Plans
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const PlanExpiredOverlay: React.FC = () => {
    const navigate = useNavigate();
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const [cardData, setCardData] = useState([
        { icon: ClientsIcon, heading: "Total Users", numbers: 0 },
        { icon: ClientsIcon, heading: "Clients", numbers: 0, isLoading: true, error: "" },
        { icon: ProvidersIcon, heading: "Providers", numbers: 0, isLoading: true, error: "" },
    ])

    const { data: totalNoOfProvider = 0, isLoading: isLoadingProviders, isError: isErrorProviders } = useQuery<number>({
        queryKey: ['totalproviders_expired_industrial'],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllTotalProviders();
                return response?.data?.totalDocument || 0;
            } catch (error) {
                console.error("Error fetching providers:", error);
                return 0;
            }
        }
    });

    const { data: totalNoOfClient = 0, isLoading: isLoadingClients, isError: isErrorClients } = useQuery<number>({
        queryKey: ['totalclients_expired_industrial', loginUserId],
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
                if (item.heading === "Providers") {
                    return { ...item, numbers: totalNoOfProvider, isLoading: isLoadingProviders, error: isErrorProviders ? "Error" : "" };
                } else if (item.heading === "Clients") {
                    return { ...item, numbers: totalNoOfClient, isLoading: isLoadingClients, error: isErrorClients ? "Error" : "" };
                } else if (item.heading === "Total Users") {
                    return { ...item, numbers: totalNoOfClient + totalNoOfProvider, isLoading: isLoadingClients || isLoadingProviders, error: isErrorClients || isErrorProviders ? "Error" : "" };
                }
                return item;
            })
        );
    }, [totalNoOfProvider, totalNoOfClient, isLoadingClients, isLoadingProviders, isErrorClients, isErrorProviders]);

    return (
        <div className='flex flex-col w-full h-full p-4 lg:p-6 overflow-y-auto rounded-xl pt-5 bg-[#F3F4F6] relative min-h-screen'>
            <TrialBanner />
            <OutletLayout heading='Dashboard'>
                <div className='flex flex-col gap-6 py-4'>
                    {/* STATS CARDS ROW - Added more separation between cards via gap-6 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {cardData?.map((data, id) => (
                            <div className="h-[140px]" key={id}>
                                <LockedSection label={data?.heading} showButton={false}>
                                    <CardDashboardLayout>
                                        <div className='p-2'>
                                            <div className='flex items-center gap-x-3 font-[Montserrat] font-semibold text-textGreyColor'>
                                                <data.icon className='text-primaryColorDark' />
                                                <p>{data?.heading}</p>
                                            </div>
                                            <p className='font-[Poppins] font-semibold text-textColor text-[34px] mt-4'>{data?.numbers}</p>
                                        </div>
                                    </CardDashboardLayout>
                                </LockedSection>
                            </div>
                        ))}
                    </div>

                    {/* MAIN CONTENT AREA - Enhanced div separation with gap-6 */}
                    <div className='flex flex-col gap-6 lg:flex-row items-start justify-between'>
                        {/* LEFT COLUMN: LISTS */}
                        <div className='flex flex-col gap-6 w-full lg:w-[68%]'>
                            <div className='w-full overflow-hidden rounded-xl'>
                                <LockedSection label="Client Portfolio Access">
                                    <CardDashboardLayout heading='Clients List'>
                                        <div className="min-h-[350px]"><ClientList /></div>
                                    </CardDashboardLayout>
                                </LockedSection>
                            </div>

                            <div className='w-full overflow-hidden rounded-xl'>
                                <LockedSection label="Provider Directory Access">
                                    <CardDashboardLayout heading='Providers List'>
                                        <div className="min-h-[350px]"><ProviderList /></div>
                                    </CardDashboardLayout>
                                </LockedSection>
                            </div>

                            <div className='w-full overflow-hidden rounded-xl'>
                                <LockedSection label="Subscription Records">
                                    <CardDashboardLayout heading='Subscription History'>
                                        <div className="min-h-[300px]"><SubscriptionHistoryCard /></div>
                                    </CardDashboardLayout>
                                </LockedSection>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: COLLABORATION - Distinct separation via lateral layout */}
                        <div className='w-full lg:w-[31%]'>
                            <div className='w-full h-full min-h-[900px]'>
                                <LockedSection label="Collaboration Suite">
                                    <CardDashboardLayout heading='Communications Hub'>
                                        <Collaboration />
                                    </CardDashboardLayout>
                                </LockedSection>
                            </div>
                        </div>
                    </div>
                </div>
            </OutletLayout>

            {/* INDUSTRIAL SECURITY BADGE */}
            <div className="flex items-center justify-center gap-2 mt-16 py-8 border-t border-[#D1D5DB] text-[#6B7280] font-[Poppins] text-[13px] uppercase tracking-wider">
                <Shield size={16} className="text-primaryColorDark" />
                <span>Enterprise Grade Security & Encrypted Connectivity</span>
            </div>
        </div>
    );
};

export default PlanExpiredOverlay;
