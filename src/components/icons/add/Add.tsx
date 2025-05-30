import React from 'react'
import { LuCirclePlus } from "react-icons/lu";
interface AddIconProps {
    onClick?: () => void
    // toolTipText?: string
}
const AddIcon: React.FC<AddIconProps> = (props) => {
    return (<div className="relative group">

        <LuCirclePlus className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />
        {/* {props?.toolTipText &&
            <ToolTip toolTipText={props.toolTipText} />
        } */}
    </div>

    )
}

export default AddIcon