import React from 'react';


const ToolTip: React.FC<{ toolTipText?: string }> = ({ toolTipText }) => {
    const lines = toolTipText ? toolTipText.split(/\\n|\n/) : [];

    return (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-pre-line rounded-lg bg-gray-900 px-3 py-2 text-[10px] sm:text-xs text-white hidden group-hover:block transition-all duration-200 z-[9999] w-max max-w-[180px] text-center shadow-2xl border border-gray-700 pointer-events-none">
            {lines.map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    {i !== lines.length - 1 && <br />}
                </React.Fragment>
            ))}
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-8 border-transparent border-t-gray-900"></span>
        </span>
    );
};

export default ToolTip;
