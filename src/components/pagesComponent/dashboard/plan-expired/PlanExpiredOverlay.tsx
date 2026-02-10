import React from 'react';
import { Lock, BarChart2, Users, LifeBuoy, Zap, FileText, Shield, Eye, ChartLine, Clock3, User, UserRoundPlus, ArrowDownToLine, Settings, Plus, ArrowUpToLine, Share, Share2, ChartNoAxesColumn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout';

interface PremiumFeature {
    id: number;
    icon: React.ElementType;
    title: string;
    description: string;
    subFeatures: string[];
}

interface Stats {
    id: number;
    label: string;
    value: string;
    icon: React.ReactNode;
}

interface RecentActivity {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}



const PlanExpiredOverlay: React.FC = () => {
    const navigate = useNavigate();

    const stats: Stats[] = [
        {
            id: 1,
            label: 'Total Views',
            value: '2,248',
            icon: <Eye className='text-[#2C9993]' size={28} />
        },
        {
            id: 2,
            label: 'Active Users',
            value: '2,248',
            icon: (
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
                        <path d="M22.9901 9.90441C23.8581 8.90489 24.3912 7.58824 24.3912 6.14198C24.3912 3.03109 21.9451 0.5 18.9378 0.5C15.9305 0.5 13.4844 3.03109 13.4844 6.14198H15.0066C15.0066 3.89926 16.7704 2.07486 18.9378 2.07486C21.1052 2.07486 22.869 3.89926 22.869 6.14198C22.869 8.3847 21.1052 10.2091 18.9378 10.2091C18.2428 10.2091 17.559 10.0188 16.9607 9.65815L16.1951 11.0192C17.0253 11.5194 17.9738 11.784 18.9378 11.784C19.9824 11.784 20.9558 11.4732 21.786 10.9442C21.878 11.0842 26.6463 12.8671 26.9786 21.1286C26.9957 21.5519 27.3324 21.8833 27.7382 21.8833C27.7493 21.8833 27.7597 21.8829 27.7709 21.8825C28.1909 21.8645 28.5172 21.4977 28.4993 21.0632C28.1731 12.9381 24.2271 10.4784 22.9901 9.90441Z" fill="#2C9993" stroke="#2C9993" />
                        <path d="M15.5142 15.2198C16.4993 14.0389 17.0997 12.5054 17.0997 10.8268C17.0997 7.11182 14.1778 4.08936 10.587 4.08936C6.99626 4.08936 4.07517 7.11179 4.07517 10.8267C4.07517 12.5053 4.67526 14.0387 5.66016 15.2197C3.93129 16.2844 0.5 19.4381 0.5 27.7123C0.5 28.1472 0.840417 28.4998 1.26113 28.4998C1.68185 28.4998 2.02226 28.1472 2.02226 27.7123C2.02226 19.1999 5.84425 16.8204 6.85537 16.34C7.91333 17.109 9.19873 17.5645 10.587 17.5645C11.9753 17.5645 13.2609 17.109 14.319 16.34C15.3302 16.8208 19.1526 19.2001 19.1526 27.7123C19.1526 28.1472 19.493 28.4998 19.9137 28.4998C20.3344 28.4998 20.6748 28.1472 20.6748 27.7123C20.6748 19.4384 17.2433 16.2847 15.5142 15.2198ZM5.5974 10.8267C5.5974 7.97996 7.83541 5.66418 10.587 5.66418C13.3387 5.66418 15.5774 7.97996 15.5774 10.8267C15.5774 13.6735 13.3386 15.9896 10.587 15.9896C7.83544 15.9896 5.5974 13.6735 5.5974 10.8267Z" fill="#2C9993" stroke="#2C9993" />
                    </svg>
                </div>
            )
        },
        {
            id: 3,
            label: 'Conversion Rate',
            value: '3.2%',
            icon: <ChartLine className='text-[#2C9993]' size={28} />
        },
        {
            id: 4,
            label: 'Avg. Session',
            value: '4m 32s',
            icon: <Clock3 className='text-[#2C9993]' size={28} />
        }
    ]

    const premiumFeatures: PremiumFeature[] = [
        {
            id: 1,
            icon: BarChart2,
            title: 'Advanced Analytics',
            description: 'Get detailed insights and reports',
            subFeatures: ['Custom Reports', 'Data Visualization', 'AI Predictions']
        },
        {
            id: 2,
            icon: Users,
            title: 'Team Collaboration',
            description: 'Collaborate with unlimited team members',
            subFeatures: ['Unlimited Members', 'Role Management', 'Real-time Sync']
        },
        {
            id: 3,
            icon: LifeBuoy,
            title: 'Priority Support',
            description: '24/7 dedicated support for your business',
            subFeatures: ['24/7 Support', 'Live Chat', 'Onboarding Help']
        },
        {
            id: 4,
            icon: Zap,
            title: 'API Access',
            description: 'Integrate with your existing tools',
            subFeatures: ['REST API', 'Webhook Support', 'Rate Limits']
        },
        {
            id: 5,
            icon: FileText,
            title: 'Custom Branding',
            description: 'Remove our branding and use your own',
            subFeatures: ['Custom Logo', 'Brand Colors', 'Custom Domain']
        },
        {
            id: 6,
            icon: Shield,
            title: 'Advanced Security',
            description: 'Enterprise-grade security features',
            subFeatures: ['SSO & 2FA', 'Audit Logs', 'Compliance']
        }
    ];
    const recentActivity: RecentActivity[] = [
        {
            id: 1,
            icon: <UserRoundPlus size={28} className='text-[#2C9993]' />,
            title: 'New User Registration',
            description: 'John Doe registered as a new user',
        },
        {
            id: 2,
            icon: <FileText size={28} className='text-[#2c9993]' />,
            title: "Report generated",
            description: "15 minutes ago"
        },
        {
            id: 3,
            icon: <ArrowDownToLine size={28} className='text-[#2c9993]' />,
            title: "Data exported",
            description: "30 minutes ago"
        },
        {
            id: 4,
            icon: <Settings size={28} className='text-[#2c9993]' />,
            title: "Settings updated",
            description: "15 minutes ago"
        },
        {
            id: 5,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none" >
                <path d="M0 5.75C0 4.70222 0.2624 3.73111 0.7872 2.83667C1.2992 1.98056 1.984 1.29694 2.8416 0.785833C3.7376 0.261944 4.7104 0 5.76 0H13.44C14.4768 0 15.4432 0.261944 16.3392 0.785833C17.2096 1.29694 17.9008 1.98694 18.4128 2.85583C18.9376 3.75028 19.2 4.715 19.2 5.75V17.25H5.76C4.7232 17.25 3.7568 16.9881 2.8608 16.4642C1.9904 15.9531 1.2992 15.2631 0.7872 14.3942C0.2624 13.4997 0 12.535 0 11.5V5.75ZM17.28 15.3333V5.75C17.28 5.06 17.1072 4.42111 16.7616 3.83333C16.416 3.24555 15.9488 2.77917 15.36 2.43417C14.7712 2.08917 14.1312 1.91667 13.44 1.91667H5.76C5.0688 1.91667 4.4288 2.08917 3.84 2.43417C3.2512 2.77917 2.784 3.24236 2.4384 3.82375C2.0928 4.40514 1.92 5.04722 1.92 5.75V11.5C1.92 12.19 2.0928 12.8289 2.4384 13.4167C2.784 14.0044 3.2512 14.4708 3.84 14.8158C4.4288 15.1608 5.0688 15.3333 5.76 15.3333H17.28ZM11.52 7.66667H13.44V9.58333H11.52V7.66667ZM5.76 7.66667H7.68V9.58333H5.76V7.66667Z" fill="#2C9993" />
            </svg >,
            title: "New comment received",
            description: "15 minutes ago"
        }
    ]
    return (
        <OutletLayout heading='Your Statistics'>
            <div className='w-full pl-2 pr-2 h-[150px] grid grid-cols-4 gap-4'>
                {stats.map((stat) => (
                    <div key={stat.id} className='w-full h-full flex flex-col items-start justify-between p-[24px] rounded-[12px] bg-inputBgColor'>
                        <div className='flex flex-col items-start gap-y-[20px]'>
                            <div className='w-full h-[48px] flex items-center justify-baseline gap-x-[15px]'>
                                {stat.icon}
                                <p className='text-[16px] font-semibold text-textGray font-[Montserrat] text-[#808B97]'>
                                    {stat.label}
                                </p>
                            </div>
                            <p className='text-[40px] font-medium font-[Poppins] text-[#101828]'>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overview */}
            <h2 className='text-[24px] font-bold font-[Poppins] text-[#101828] mt-[60px] '>Overview</h2>
            <div className='h-[447px] w-full pl-2 pr-2 flex gap-x-[24px]'>
                <div className='w-1/2 h-full bg-inputBgColor rounded-[10px] p-[24px] flex flex-col justify-between items-start'>
                    <p className='text-[20px] font-medium font-[Poppins] text-[#333333] mb-4'>Recent Activity</p>
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className='flex flex-col w-full'>
                            <div className='w-full flex items-center justify-start gap-x-[12px]'>
                                <div className='flex items-center justify-start'>
                                    <div className='w-[48px] h-[48px] rounded-[8px] bg-white flex items-center justify-center'>
                                        {activity.icon}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-0'>
                                    <p className='text-[16px] font-medium text-textGray font-[Poppins] text-[#333333]'>
                                        {activity.title}
                                    </p>
                                    <p className='text-[12px] font-normal text-textGray font-[Poppins] text-[#555555]'>
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                            {activity.id !== 5 && <div className='w-full bg-white h-px mt-3 mb-2' />}
                        </div>

                    ))}

                </div>

                <div className='w-1/2 h-full bg-inputBgColor rounded-[10px] p-[24px] flex flex-col justify-between items-start '>
                    <div className='flex items-center h-[190px] w-full justify-between gap-x-[24px]'>
                        <div className='w-1/2 h-[190px] flex flex-col items-center justify-center bg-white rounded-[8px] gap-y-[12px] p-[17px]'>
                            <div className='h-[78px] w-[78px] rounded-[13px]  bg-[#DBEAFE] flex items-center justify-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="41" height="39" viewBox="0 0 41 39" fill="none">
                                    <path d="M5.6875 33.3125C5.6875 32.415 6.41504 31.6875 7.3125 31.6875H33.3125C34.21 31.6875 34.9375 32.415 34.9375 33.3125C34.9375 34.21 34.21 34.9375 33.3125 34.9375H7.3125C6.41504 34.9375 5.6875 34.21 5.6875 33.3125ZM24.7115 13.044C23.6879 12.0204 21.9375 12.7454 21.9375 14.1931V26.8125C21.9375 27.71 21.21 28.4375 20.3125 28.4375C19.415 28.4375 18.6875 27.71 18.6875 26.8125V14.1931C18.6875 12.7454 16.9371 12.0204 15.9135 13.0441L9.96128 18.9962C9.32539 19.6321 8.29329 19.6284 7.66193 18.9881C7.03687 18.3541 7.04049 17.3345 7.67003 16.705L19.1635 5.21155C19.7981 4.57695 20.8269 4.57695 21.4615 5.21155L32.955 16.705C33.5845 17.3345 33.5881 18.3541 32.9631 18.9881C32.3317 19.6284 31.2996 19.6321 30.6637 18.9962L24.7115 13.044Z" fill="#2563EB" />
                                </svg>
                            </div>
                            <p className='text-[20px] font-medium font-[Poppins] text-[#111327]'>
                                Upload File
                            </p>
                        </div>
                        <div className='w-1/2 h-[190px] flex flex-col items-center justify-center bg-white rounded-[8px] gap-y-[12px] p-[17px]'>
                            <div className='h-[78px] w-[78px] rounded-[13px]  bg-[#CCFBF1] flex items-center justify-center'>
                                <Plus size={30} className='text-[#0D9488]' />
                            </div>
                            <p className='text-[20px] font-medium font-[Poppins] text-[#111327]'>
                                Create New
                            </p>
                        </div>

                    </div>




                    <div className='flex items-center h-[190px] w-full justify-between gap-x-[24px]'>
                        <div className='w-1/2 h-[190px] flex flex-col items-center justify-center bg-white rounded-[8px] gap-y-[12px] p-[17px]'>
                            <div className='h-[78px] w-[78px] rounded-[13px]  bg-[#DCFCE7] flex items-center justify-center'>
                                <Share2 className='text-[#16A34A]' size={30} />
                            </div>
                            <p className='text-[20px] font-medium font-[Poppins] text-[#111327]'>
                                Share
                            </p>
                        </div>
                        <div className='w-1/2 h-[190px] flex flex-col items-center justify-center bg-white rounded-[8px] gap-y-[12px] p-[17px]'>
                            <div className='h-[78px] w-[78px] rounded-[13px]  bg-[#FFEDD5] flex items-center justify-center'>
                                <ChartNoAxesColumn size={30} className='text-[#EA580C]' />
                            </div>
                            <p className='text-[20px] font-medium font-[Poppins] text-[#111327]'>
                                Analytics
                            </p>
                        </div>

                    </div>

                </div>
            </div>
            {/* Premium Features */}
            <h2 className='text-[24px] font-bold font-[Poppins] text-[#101828] mt-[60px] '>Premium Features</h2>


            {/* Locked Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumFeatures.map((feature) => (
                    <div
                        key={feature.id}
                        className="relative bg-white border border-[#E5E7EB] rounded-[16px] p-8 overflow-hidden group"
                    >
                        {/* Blurred Content */}
                        <div className="opacity-[0.15] blur-[1px] select-none pointer-events-none flex flex-col h-full items-center text-center">
                            <div className="w-12 h-12 bg-[#F2F4F7] rounded-full flex items-center justify-center text-[#2C9993] mb-4">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#101828] mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-[14px] text-[#667085] mb-6">
                                {feature.description}
                            </p>
                            <div className="w-full space-y-2 text-left mt-auto">
                                {feature.subFeatures.map((sub, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[12px] text-[#2C9993]">
                                        <span>✓</span> {sub}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overlay Content (Centered) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                            {/* Lock Icon Circle */}
                            <div className="w-12 h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-3">
                                <Lock className="text-[#2C9993]" size={20} />
                            </div>

                            {/* Upgrade Text */}
                            <p className="text-[14px] font-semibold text-[#101828] mb-3">
                                Upgrade to unlock
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={() => navigate('/select-plan')}
                                className="bg-[#0E9384] text-white py-2 px-6 cursor-pointer rounded-[8px] font-medium text-[14px] hover:bg-[#0B786B] transition-colors shadow-sm"
                            >
                                View Plans
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </OutletLayout>
    );
};

export default PlanExpiredOverlay;
