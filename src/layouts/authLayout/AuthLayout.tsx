
import authImage from "../../assets/images/authImage.webp"

interface authProps {
    children?: React.ReactNode
    heading?: string
}

const AuthLayout: React.FC<authProps> = (props) => {
    return (
        <div className='flex min-h-screen items-stretch'>
            {/* Left Side - Form Section */}
            <div className='w-full md:w-1/2 flex items-center justify-center'>
                <div className='w-full md:w-[70%] rounded-[20px] bg-white px-6 md:px-10 lg:px-14 py-4 md:drop-shadow-md'>
                    <p className='heading text-center mb-4 capitalize'>{props.heading}</p>
                    {props.children}
                </div>
            </div>

            {/* Right Side - Image Section */}
            <div className='hidden md:flex md:w-1/2 bg-primaryColorLight items-center justify-center rounded-bl-[20px] rounded-tl-[20px]'>
                <img
                    src={authImage}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className='w-full h-screen object-cover'
                />

            </div>
        </div>
    );
};

export default AuthLayout