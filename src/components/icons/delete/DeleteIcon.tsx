import { MdDeleteOutline } from "react-icons/md";
import ToolTip from "../../toolTip/ToolTip";

interface DeleteIconProps {
    onClick?: () => void;
    disable?: boolean;
}

const DeleteIcon: React.FC<DeleteIconProps> = ({ onClick, disable = false }) => {
    return (
        <div className="relative group">
            <MdDeleteOutline
                size={20}
                className={`${disable ? "text-gray-300 cursor-not-allowed" : "text-textGreyColor cursor-pointer"}`}
                onClick={disable ? undefined : onClick}
            />
            {!disable && <ToolTip toolTipText="Delete" />}
        </div>
    );
};

export default DeleteIcon;
