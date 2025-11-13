

interface ButtonProps {
    text?: string
    onclick?: (data: unknown) => void
    icon?: React.ReactNode
    sm?: boolean
    borderButton?: boolean
    danger?: boolean

}

const Button: React.FC<ButtonProps> = ({ text, sm = false, onclick, icon, borderButton = false, danger = false }) => {
    return (
        <button
            className={`capitalize flex items-center justify-center gap-2 border-1 ${danger ? "hover:bg-redColor/80 hover:text-white " : "hover:bg-primaryColorDark/80 hover:text-white "} 
                border-greenColor ${borderButton ? "bg-white text-greenColor" : danger ? "border-redColor text-redColor bg-white" : "bg-greenColor text-white"} 
                 text-center rounded-md font-[Poppins] w-full cursor-pointer text-[12px] md:text-[14px] ${sm ? "py-1" : "py-2"}`}
            onClick={onclick}
            type="submit"
        >
            {icon} {text}
        </button>
    )
}


export default Button