
import { FaRegEdit } from "react-icons/fa";
interface EditIconProps {
    onClick?: () => void
}
const EditIcon: React.FC<EditIconProps> = (props) => {
    return (
        <FaRegEdit size={18} className='cursor-pointer  text-textGreyColor' onClick={props.onClick} />
    )
}

export default EditIcon