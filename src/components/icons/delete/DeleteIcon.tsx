import { AiOutlineDelete } from "react-icons/ai";
interface DeleteIconProps {
    onClick?: () => void
    disable?: boolean
}
const DeleteIcon: React.FC<DeleteIconProps> = ({ onClick, disable = false }) => {
    return (
        <AiOutlineDelete size={18} className={` ${disable ? 'text-gray-300 cursor-not-allowed' : 'text-textGreyColor cursor-pointer'} `} onClick={onClick} />
    )
}


export default DeleteIcon