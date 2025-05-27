import { FaRegEdit } from "react-icons/fa";
import ToolTip from "../../toolTip/ToolTip";

interface EditIconProps {
    onClick?: () => void;
    disable?: boolean;
}

const EditIcon: React.FC<EditIconProps> = ({ onClick, disable = false }) => {
    return (
        <div className="relative group">
            <FaRegEdit
                size={18}
                className={`${disable ? "text-gray-300 cursor-not-allowed" : "text-textGreyColor cursor-pointer"}`}
                onClick={disable ? undefined : onClick}
            />
            {!disable && <ToolTip toolTipText="Edit" />}
        </div>
    );
};

export default EditIcon;
