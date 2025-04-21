
import UserIcon from '../../../../icons/user/User'
interface BlockUserAccountProps {
    image?: string
    name?: string
    isBlock?: boolean | string
}
const BlockUserAccount: React.FC<BlockUserAccountProps> = (props) => {
    return (
        <div className='flex items-center justify-between mt-6 border-b-[1px] border-b-lightGreyColor/30 border-b-solid pb-4'>
            <div className='flex items-center bg-white relative gap-x-2 '>
                <UserIcon className="text-[22px] md:text-[30px] lg:text-[30px]" />

                <div className='flex items-center gap-x-10'>
                    <div className='font-[Poppins]'>
                        <p className=' text-textColor font-semibold text-[12px] md:text-[14px] '>{props.name}</p>

                    </div>

                </div>
            </div>
            <p className={`text-center  border-solid border-[1px] rounded-full w-[70px] py-1 text-[12px]  font-semibold  cursor-pointer ${props.isBlock ? "text-textGreyColor border-textGreyColor" : "text-redColor border-redColor"}`}>{props.isBlock ? "Remove" : "Block"}</p>
        </div>
    )
}

export default BlockUserAccount