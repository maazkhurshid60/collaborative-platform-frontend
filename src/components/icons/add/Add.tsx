import React from 'react'
import { LuCirclePlus } from "react-icons/lu";
interface AddIconProps {
    onClick?: () => void
    className?: string
}
const AddIcon: React.FC<AddIconProps> = (props) => {
    return (<div className="relative group">

        <LuCirclePlus className={`cursor-pointer text-xl text-textGreyColor ${props.className}`}
            onClick={props.onClick}
        />

    </div>

    )
}

export default AddIcon