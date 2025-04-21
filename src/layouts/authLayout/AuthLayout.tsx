
import authImage from "../../assets/images/authImage.png"

interface authProps {
    children?: React.ReactNode
    heading?: string
}

const AuthLayout: React.FC<authProps> = (props) => {
    return <div className='flex items-center'>

        <div className='w-[100%] md:w-[50%] flex items-center justify-center'>

            <div className='w-[100%] md:w-[70%] rounded-[20px] bg-white px-6 md:px-10 lg:px-14 py-4 md:drop-shadow-md'>
                <p className='heading text-center mb-4 capitalize'>{props.heading}</p>
                {props.children}
            </div>
        </div>
        <div className='hidden  md:w-[50%] md:h-[100vh] md:bg-primaryColorLight md:flex md:items-center md:justify-center md:rounded-bl-[20px] md:rounded-tl-[20px]'>
            <img src={authImage} alt="Auth Img" className='object-cover w-[90%]' />
        </div>

    </div>

}

export default AuthLayout