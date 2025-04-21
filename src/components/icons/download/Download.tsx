
import { MdOutlineFileDownload } from "react-icons/md";

interface DownloadIconProps {
    onClick?: () => void
}
const DownloadIcon: React.FC<DownloadIconProps> = (props) => {
    return (
        <MdOutlineFileDownload size={18} className='cursor-pointer  text-textGreyColor' onClick={props.onClick} />
    )
}

export default DownloadIcon