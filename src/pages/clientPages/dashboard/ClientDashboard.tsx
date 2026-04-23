import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import CardDashboardLayout from '../../../layouts/dashboardLayout/CardDashboardLayout'
import Collaboration from '../../../components/pagesComponent/dashboard/collaboration/Collaboration'
import TrialBanner from '../../../components/pagesComponent/dashboard/trialBanner/TrialBanner'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import ClientsIcon from '../../../components/icons/dashboardIcons/providersPortalIcons/clients/Clients'
import DocumentIcon from '../../../components/icons/dashboardIcons/clientsPortalIcons/document/Document'
import { useState, useEffect } from 'react'

const ClientDashboard = () => {
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails)
    const providerList = loginUserDetail?.providerList || []

    const [cardData, setCardData] = useState([
        { icon: ClientsIcon, heading: "My Providers", numbers: providerList.length },
        { icon: DocumentIcon, heading: "My Documents", numbers: 0 },
    ])

    useEffect(() => {
        setCardData([
            { icon: ClientsIcon, heading: "My Providers", numbers: providerList.length },
            { icon: DocumentIcon, heading: "My Documents", numbers: 0 },
        ])
    }, [providerList.length])

    return (
        <div className='flex flex-col w-full h-full p-3 overflow-y-auto rounded-lg pt-5 bg-white'>
            <TrialBanner />
            <OutletLayout heading='Client Dashboard'>
                <div className='flex flex-col gap-3'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cardData?.map((data, id: number) => {
                            const Icon = data?.icon
                            return (
                                <div className=" h-[120px] " key={id}>
                                    <CardDashboardLayout>
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
                            <div className=' w-full max-h-screen lg:w-[98%] overflow-x-auto rounded-md'>
                                <CardDashboardLayout heading='All Providers'>
                                    <div className="p-4">
                                        {providerList.length === 0 ? (
                                            <p className="text-gray-500">No providers linked to your account.</p>
                                        ) : (
                                            <ul className="divide-y divide-gray-200">
                                                {providerList.map((item: any, index: number) => (
                                                    <li key={index} className="py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primaryColorLight flex items-center justify-center text-primaryColorDark font-bold uppercase">
                                                                {item.provider?.user?.fullName?.charAt(0) || 'P'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.provider?.user?.fullName}</p>
                                                                <p className="text-sm text-gray-500">{item.provider?.specialty || 'Provider'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase">
                                                            Active
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </CardDashboardLayout>
                            </div>
                        </div>
                        <div className='w-[110%] min-h-screen lg:w-[31.5%] overflow-y-auto'>
                            <CardDashboardLayout heading='Collaborations'>
                                <Collaboration />
                            </CardDashboardLayout>
                        </div>
                    </div>
                </div>
            </OutletLayout>
        </div>
    )
}

export default ClientDashboard
