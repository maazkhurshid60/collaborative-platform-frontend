import { HiMiniUserCircle } from "react-icons/hi2";

interface UserIconProps {
    onClick?: () => void;
    size?: number;
    className?: string;
    profileImg?: string;
}

const UserIcon: React.FC<UserIconProps> = ({
    onClick,
    className = "text-[32px] md:text-[40px] lg:text-[40px]",
    profileImg
}) => {

    if (profileImg) {
        return (
            <img
                src={profileImg}
                alt="User Profile"
                className={`rounded-full object-cover cursor-pointer ${className}`}
                onClick={onClick}
            />
        );
    }

    return (
        <HiMiniUserCircle
            className={`cursor-pointer ${className}`}
            onClick={onClick}
        />
    );
};

export default UserIcon;
