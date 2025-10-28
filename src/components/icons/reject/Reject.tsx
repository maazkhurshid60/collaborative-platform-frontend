import React from 'react'
import { LuUserRoundX } from "react-icons/lu";
import ToolTip from '../../toolTip/ToolTip';
interface RejectIconProps {
    onClick?: () => void
}
const RejectIcon: React.FC<RejectIconProps> = (props) => {
    return (<div className="relative group">

        <LuUserRoundX className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />
        <ToolTip toolTipText="Reject" />


    </div>

    )
}

export default RejectIcon