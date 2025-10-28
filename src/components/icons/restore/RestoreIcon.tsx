import ToolTip from "../../toolTip/ToolTip";
import { LuArchiveRestore } from "react-icons/lu";


interface RestoreIconProps extends React.SVGProps<SVGSVGElement> {
    disabled?: boolean;
}

const RestoreIcon = ({ disabled = false, ...props }: RestoreIconProps) => (
    <div
        className={`relative group ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
        <LuArchiveRestore className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />

        {!disabled && <ToolTip toolTipText="Restore" />}
    </div>
);

export default RestoreIcon;
