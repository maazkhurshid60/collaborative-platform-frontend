import React from "react";

interface ToolTipProps {
  toolTipText?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const ToolTip: React.FC<ToolTipProps> = ({ toolTipText, position = "top" }) => {
  const lines = toolTipText ? toolTipText.split(/\\n|\n/) : [];

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-0.5 border-t-gray-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-b-gray-900",
    left: "left-full top-1/2 -translate-y-1/2 -ml-0.5 border-l-gray-900",
    right: "right-full top-1/2 -translate-y-1/2 -mr-0.5 border-r-gray-900",
  };

  return (
    <span
      className={`absolute ${positionClasses[position]} whitespace-pre-line rounded-lg bg-gray-900 px-3 py-2 text-[10px] sm:text-xs text-white hidden group-hover:block transition-all duration-200 z-99999 w-max max-w-45 text-center shadow-2xl border border-gray-700 pointer-events-none`}
    >
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== lines.length - 1 && <br />}
        </React.Fragment>
      ))}
      {/* Arrow */}
      <span
        className={`absolute border-4 border-transparent ${arrowClasses[position]}`}
      ></span>
    </span>
  );
};

export default ToolTip;
