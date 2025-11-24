import React from 'react'
import { LuLoader } from 'react-icons/lu'
interface SpinnerLoaderProps {
    text: string
}
const SpinnerLoader: React.FC<SpinnerLoaderProps> = (props) => {
    return (
        <div className="flex items-center justify-center text-gray-500 text-sm mt-4 gap-2">

            <LuLoader size={20} className='animate-spin' />
            {props.text} ...
        </div>
    )
}

export default SpinnerLoader