import { IoDocumentTextOutline } from "react-icons/io5";
import ToolTip from "../../toolTip/ToolTip";

interface ShareDocumentIconProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
}

const ShareDocumentIcon = ({ disabled = false, ...props }: ShareDocumentIconProps) => (
    <div
        className={`relative group ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}`}
        {...props}
    >
        <span className="text-xl text-textGreyColor">
            <IoDocumentTextOutline />
        </span>
        {!disabled && <ToolTip toolTipText="Share document" />}
    </div>
);

export default ShareDocumentIcon;
