
import { FaRegEdit } from "react-icons/fa";
interface EditIconProps {
    onClick?: () => void
    disable?: boolean
}
const EditIcon: React.FC<EditIconProps> = ({ onClick, disable = false }) => {
    return (
        <FaRegEdit size={18} className={` ${disable ? 'text-gray-300 cursor-not-allowed' : 'text-textGreyColor cursor-pointer'} `} onClick={onClick} />
    )
}

export default EditIcon