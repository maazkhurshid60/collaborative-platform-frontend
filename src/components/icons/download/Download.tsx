
import { MdOutlineFileDownload } from "react-icons/md";
import ToolTip from "../../toolTip/ToolTip";

interface DownloadIconProps {
    onClick?: () => void
}
const DownloadIcon: React.FC<DownloadIconProps> = (props) => {
    return (
        <div className="relative group">

            <MdOutlineFileDownload size={18} className='cursor-pointer  text-textGreyColor' onClick={props.onClick} />
            <ToolTip toolTipText="Download" />
        </div>
    )
}

export default DownloadIcon