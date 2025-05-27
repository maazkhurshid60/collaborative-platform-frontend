
import { IoEyeOutline } from "react-icons/io5";
import ToolTip from "../../toolTip/ToolTip";

interface ViewIconProps {
    onClick?: () => void
}
const ViewIcon: React.FC<ViewIconProps> = (props) => {
    return (
        <div className="relative group">

            <IoEyeOutline size={18} className='cursor-pointer  text-textGreyColor' onClick={props.onClick} />
            <ToolTip toolTipText="view" />
        </div>
    )
}

export default ViewIcon