


interface OutletLayoutProps {
    children: React.ReactNode
    button?: React.ReactNode
    heading?: string
    isWhiteColor?: boolean
}

const OutletLayout: React.FC<OutletLayoutProps> = ({
    children,
    heading,
    isWhiteColor = true, // default value here,
    button
}) => {
    return (


        <div className={`${isWhiteColor ? "bg-white" : "bg-transparent"}  w-full p-3  pt-5 lg:p-5 md:pt-15 rounded-lg min-h-[86.5vh]  
        font-[Poppins] text-textColor
          h-auto sm:h-auto 
        `}>
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





