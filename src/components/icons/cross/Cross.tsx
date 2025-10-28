import React from 'react'
import ToolTip from '../../toolTip/ToolTip'
interface CrossIconProps {
    onClick: () => void
}
const CrossIcon: React.FC<CrossIconProps> = (props) => {
    return (
        <button
            type="button"
            onClick={props.onClick}
            className="absolute cursor-pointer top-[-2px] right-[-4px] bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            title="Remove"
        >
            <div className="relative group">

                ×

                <ToolTip toolTipText="Remove" />
            </div>
        </button>
    )
}

export default CrossIcon