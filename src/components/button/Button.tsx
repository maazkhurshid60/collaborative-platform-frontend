

interface ButtonProps {
    text?: string
    onclick?: (data: unknown) => void
    icon?: React.ReactNode
    sm?: boolean
    borderButton?: boolean

}

const Button: React.FC<ButtonProps> = ({ text, sm = false, onclick, borderButton = false }) => {
    return (
        <button className={`capitalize border-1 border-greenColor ${borderButton ? "bg-white  text-greenColor" : "bg-greenColor text-white"} text-center  rounded-md font-[Poppins] w-[100%] cursor-pointer  text-[12px] md:text-[16px] ${sm ? "py-1  " : "py-2 "}`} onClick={onclick}> {text}</button>
    )
}

export default Button