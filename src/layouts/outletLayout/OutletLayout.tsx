import React from "react"



interface OutletLayoutProps {
    children: React.ReactNode
    button?: React.ReactNode
    heading?: string
    isWhiteColor?: boolean
    backButton?: React.ReactNode // Add a new prop for back button
    isEdit?: boolean
}

const OutletLayout: React.FC<OutletLayoutProps> = ({
    children,
    heading,
    isWhiteColor = true,
    button,
    backButton,

}) => {
    return (
        <div className={`${isWhiteColor ? "bg-white" : "bg-transparent"} relative  w-full p-3  pt-5 rounded-lg space-y-7   
        font-[Poppins] text-textColor 
        `}>
            {/* Render the back button here with absolute positioning */}
            {backButton && (
                <div className="absolute top-0 left-0 z-20 w-7 h-7"> {/* Adjust top/left as needed */}
                    {backButton}
                </div>
            )}
            <div className='flex items-center justify-between w-full'>

                <p className='headingMedium w-[150px] sm:w-[400px] mb-3'>{heading}</p>
                <div className='w-[170px]'>
                    {button}
                </div>
            </div>

            {children}

        </div>
    );
};
export default OutletLayout

