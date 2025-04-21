
import { RiArrowLeftSLine } from 'react-icons/ri'
interface LabelTextProps {
    label?: string
    text?: string
    onClick?: () => void
    isTextBlackColor?: boolean
}
const LabelText: React.FC<LabelTextProps> = ({ isTextBlackColor = false, label, text, onClick }) => {
    return (
        <div className='flex items-center justify-between mt-6'>
            <div>
                <p className='text-[16px] font-medium'>{label}</p>
                <p className={` ${isTextBlackColor ? "text-textColor" : "text-textGreyColor"} font-medium text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]`}>{text}</p>
            </div>
            <RiArrowLeftSLine className='rotate-[180deg] text-textGreyColor cursor-pointer text-4xl  md:text-2xl' onClick={onClick} />
        </div>
    )
}

export default LabelText