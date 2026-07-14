import React from 'react'
import { LuCirclePlus } from "react-icons/lu";
import ToolTip from '../../toolTip/ToolTip';
interface AddIconProps {
    onClick?: () => void
    className?: string
}
const AddIcon: React.FC<AddIconProps> = (props) => {
    return (
        <LuCirclePlus className={`cursor-pointer text-xl text-textGreyColor ${props.className}`}
            onClick={props.onClick}
        />
    )


}

export default AddIcon
