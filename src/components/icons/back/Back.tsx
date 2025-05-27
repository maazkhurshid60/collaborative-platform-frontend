import { IoIosArrowBack } from "react-icons/io";
import ToolTip from "../../toolTip/ToolTip";

interface BackProps {
    onClick: () => void
}

const BackIcon: React.FC<BackProps> = (props) => {
    return (
        <div className="relative group">

            <IoIosArrowBack className='cursor-pointer text-textGreyColor text-xl lg:text-2xl p-0.5 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  h-[28px] w-[28px] rounded-full' onClick={props.onClick} />
            <ToolTip toolTipText="Back" />
        </div>
    )
}

export default BackIcon