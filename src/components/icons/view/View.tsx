
import { IoEyeOutline } from "react-icons/io5";

interface ViewIconProps {
    onClick?: () => void
}
const ViewIcon: React.FC<ViewIconProps> = (props) => {
    return (
        <IoEyeOutline size={18} className='cursor-pointer  text-textGreyColor' onClick={props.onClick} />
    )
}

export default ViewIcon