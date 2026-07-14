import { HiMiniUserCircle } from "react-icons/hi2";

interface UserIconProps {
    onClick?: () => void;
    size?: number;
    className?: string;
    profileImg?: string | null
}

const UserIcon: React.FC<UserIconProps> = ({
    onClick,
    className = "",
    profileImg,
    size
}) => {

    if (profileImg && profileImg !== "null") {
        return (
            <img
                src={profileImg}
                alt="User Profile"
                className={`rounded-full w-[50px] h-[50px] object-cover  ${className}`}
                onClick={onClick}
            />
        );
    }

    return (
        <HiMiniUserCircle
            size={size}
            color="black"
            className={`w-[60px] h-[60px] rounded-full  ${className}`}
            onClick={onClick}
        />
    );
};

export default UserIcon;
