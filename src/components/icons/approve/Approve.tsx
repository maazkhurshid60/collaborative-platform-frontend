import React from 'react'
import { LuUserRoundCheck } from "react-icons/lu";
import ToolTip from '../../toolTip/ToolTip';
interface ApproveIconProps {
    onClick?: () => void
}
const ApproveIcon: React.FC<ApproveIconProps> = (props) => {
    return (<div className="relative group">

        <LuUserRoundCheck className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />
        <ToolTip toolTipText="Approve" />


    </div>

    )
}

export default ApproveIcon