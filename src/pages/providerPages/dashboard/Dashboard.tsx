import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import CardDashboardLayout from '../../../layouts/dashboardLayout/CardDashboardLayout'
import Collaboration from '../../../components/pagesComponent/dashboard/collaboration/Collaboration'

import { PiUsers } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import ClientList from '../../../components/pagesComponent/dashboard/clientList/ClientList';
import ProviderList from '../../../components/pagesComponent/dashboard/providerList/ProviderList';


const Dashboard = () => {

    const cardData = [
        { icon: PiUsers, heading: "Total Users", numbers: 200 },
        { icon: PiUsers, heading: "Clients", numbers: 1034 },
        { icon: TbUsersPlus, heading: "Providers", numbers: 1024 },
    ]

    return (
        <OutletLayout heading='Dashboard'>
            <div className='flex flex-col gap-3'>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">



                    {cardData?.map((data, id: number) => {
                        const Icon = data?.icon
                        return (
                            <div className=" h-[120px] ">
                                <CardDashboardLayout>
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
                    <div className='w-[100%] lg:w-[65.5%] flex flex-col gap-3 flex-wrap'>
                        <div className='h-[380px]'>
                            <CardDashboardLayout heading='Client List'>
                                <ClientList />
                            </CardDashboardLayout>
                        </div>
                        <div className='h-[380px]'>
                            <CardDashboardLayout heading='Provider List'>
                                <ProviderList />

                            </CardDashboardLayout>
                        </div>
                    </div>
                    <div className='w-[100%] lg:w-[33.5%] h-[772px]'>
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