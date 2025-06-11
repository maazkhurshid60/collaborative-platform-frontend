import React from 'react'
import { LuCirclePlus } from "react-icons/lu";
interface AddIconProps {
    onClick?: () => void
}
const AddIcon: React.FC<AddIconProps> = (props) => {
    return (<div className="relative group">

        <LuCirclePlus className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />

    </div>

    )
}

export default AddIcon