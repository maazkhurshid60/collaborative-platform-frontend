import { AiOutlineDelete } from "react-icons/ai";
interface DeleteIconProps {
    onClick?: () => void
}
const DeleteIcon: React.FC<DeleteIconProps> = (props) => {
    return (
        <AiOutlineDelete size={18} className='cursor-pointer text-textGreyColor' onClick={props.onClick} />
    )
}

export default DeleteIcon