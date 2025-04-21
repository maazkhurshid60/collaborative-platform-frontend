
import UserIcon from '../../../icons/user/User'
interface UserAccountProps {
    profile?: string
    name?: string
    email?: string
}
const UserAccount: React.FC<UserAccountProps> = (props) => {
    return (
        <div className='flex items-center bg-white relative gap-x-2 mt-6'>
            <UserIcon className="text-[22px] md:text-[30px] lg:text-[38px]" />

            <div className='flex items-center gap-x-10'>
                <div className='font-[Poppins]'>
                    <p className=' text-textColor font-semibold text-[14px] md:text-[16px] lg:text-[18px]'>{props.name}</p>
                    <p className='text-lightGreyColor font-medium text-[12px] lg:text-[14px]'>{props.email}</p>
                </div>

            </div>

        </div>
    )
}

export default UserAccount