
import { HiMiniUserCircle } from "react-icons/hi2";

interface UserIconProps {
    onClick?: () => void
    size?: number
    className?: string
}
const UserIcon: React.FC<UserIconProps> = ({
    onClick, className = "text-[32px] md:text-[40px] lg:text-[40px] " }) => {
    return (
        <HiMiniUserCircle className={` cursor-pointer ${className ? className : 'text-textGreyColor'}`} onClick={onClick} />
    )
}

export default UserIcon