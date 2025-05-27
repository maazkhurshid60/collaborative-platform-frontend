import React from 'react';


const ToolTip: React.FC<{ toolTipText?: string }> = ({ toolTipText }) => {
    return (
        <span className="absolute left-1/2 capitalize -translate-x-1/2 -top-8 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white hidden group-hover:block transition-opacity z-50">
            {toolTipText}
        </span>
    );
};

export default ToolTip;
