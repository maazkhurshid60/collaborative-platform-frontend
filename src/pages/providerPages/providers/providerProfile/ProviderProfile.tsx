
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../../components/icons/back/Back'
import { useNavigate } from 'react-router-dom'
import LabelData from '../../../../components/labelText/LabelData'
import UserIcon from '../../../../components/icons/user/User'

const ProviderProfile = () => {
    const navigate = useNavigate()
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
                    <UserIcon className='text-6xl mt-2' />
                </div>

                {/* <div className='flex items-center justify-between flex-wrap gap-y-10 mt-10'> */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                    <div className=''>
                        <LabelData label='Full Name' data='Provider1' />
                    </div>
                    <div className=''>
                        <LabelData label='CNIC Number' data='0000-0000000-00' />
                    </div>
                    <div className=''>
                        <LabelData label='Age' data='23' />
                    </div>
                    <div className=''>
                        <LabelData label='Email' data='provider@gmail.com' />
                    </div>
                    <div className=''>
                        <LabelData label='Contact No' data='0000-0000000' />
                    </div>
                    <div className=''>
                        <LabelData label='Address' data='Islamabad' />
                    </div>
                    <div className=' '>
                        <LabelData label='List of Active Clients' />
                        <ul className='text-[14px] font-medium text-textGreyColor list-disc ml-6'>
                            <li>Client2</li>
                            <li>Client4</li>
                        </ul>
                    </div>
                </div>
            </div>
        </OutletLayout>
    )
}

export default ProviderProfile