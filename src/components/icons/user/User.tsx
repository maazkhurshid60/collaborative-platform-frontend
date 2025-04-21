
import { FaRegUserCircle } from "react-icons/fa";

interface UserIconProps {
    onClick?: () => void
    size?: number
    className?: string
}
const UserIcon: React.FC<UserIconProps> = ({
    onClick, className = "text-[32px] md:text-[40px] lg:text-[40px] " }) => {
    return (
        <FaRegUserCircle className={` ${className ? className : 'cursor-pointer  text-textGreyColor'}`} onClick={onClick} />
    )
}

export default UserIcon