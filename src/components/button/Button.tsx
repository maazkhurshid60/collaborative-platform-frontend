

interface ButtonProps {
    text?: string
    onclick?: (data: unknown) => void
    icon?: React.ReactNode
    sm?: boolean
    borderButton?: boolean

}

const Button: React.FC<ButtonProps> = ({ text, sm = false, onclick, icon, borderButton = false }) => {
    return (
        <button
            className={`capitalize flex items-center justify-center gap-2 border-1 hover:bg-primaryColorDark/80  hover:text-white   border-greenColor ${borderButton ? "bg-white text-greenColor" : "bg-greenColor text-white"} text-center rounded-md font-[Poppins] w-full cursor-pointer text-[12px] md:text-[16px] ${sm ? "py-1" : "py-2"}`}
            onClick={onclick}
        >
            {icon} {text}
        </button>
    )
}


export default Button