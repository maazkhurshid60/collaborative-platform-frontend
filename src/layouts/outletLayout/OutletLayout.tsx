import React from "react";

interface OutletLayoutProps {
  children: React.ReactNode;
  button?: React.ReactNode;
  heading?: string;
  isWhiteColor?: boolean;
  backButton?: React.ReactNode;
  isEdit?: boolean;
  onEditClick?: () => void;
  buttonContainerClass?: string;
}

const OutletLayout: React.FC<OutletLayoutProps> = ({
  children,
  heading,
  isWhiteColor = true,
  button,
  backButton,
  isEdit,
  onEditClick,
  buttonContainerClass,
}) => {
  return (
    <div
      className={`${isWhiteColor ? "bg-white" : "bg-transparent"} relative  w-full p-3  rounded-lg space-y-7   
        font-[Poppins] text-textColor 
        `}
    >
      {/* Render the back button here with absolute positioning */}
      {backButton && (
        <div className="absolute top-0 left-0 z-20 w-7 h-7">
          {" "}
          {/* Adjust top/left as needed */}
          {backButton}
        </div>
      )}
      {(heading || button || isEdit) && (
        <div className="flex items-center justify-between w-full">
          <p className="headingMedium w-37.5 sm:w-100 mb-3">{heading}</p>

          <div
            className={`${buttonContainerClass || "w-42.5"} flex justify-end gap-x-2`}
          >
            {isEdit && (
              <button
                onClick={onEditClick}
                className="bg-primaryColorDark text-white px-4 py-2 rounded-md font-medium"
              >
                Edit
              </button>
            )}

            {button}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
export default OutletLayout;
