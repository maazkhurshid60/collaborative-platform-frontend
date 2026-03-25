

interface ButtonProps {
    text?: string
    onclick?: (data: unknown) => void
    icon?: React.ReactNode
    sm?: boolean
    borderButton?: boolean
    danger?: boolean
    isLoading?: boolean
    disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ text, sm = false, onclick, icon, borderButton = false, danger = false, isLoading = false, disabled = false }) => {
    return (
        <button
            className={`capitalize flex items-center justify-center gap-2 border 
                ${danger ? "hover:bg-redColor/80 hover:text-white " : "hover:bg-primaryColorDark/80 hover:text-white "} 
                ${borderButton ? "bg-white text-greenColor" : danger ? "border-redColor text-redColor bg-white" : "bg-greenColor text-white"} 
                border-greenColor text-center rounded-md font-[Poppins] w-full cursor-pointer text-[12px] md:text-[14px] 
                ${sm ? "py-1" : "py-2"} 
                ${(isLoading || disabled) ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={isLoading || disabled ? undefined : onclick}
            type={onclick ? "button" : "submit"}
            disabled={isLoading || disabled}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    {icon} {text}
                </>
            )}
        </button>
    )
}


export default Button