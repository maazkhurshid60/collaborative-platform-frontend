import React from 'react'
import './loader.css'
interface LoaderProps {
    text?: string

}
const Loader: React.FC<LoaderProps> = ({ text }) => {
    return (
        <div className='w-[100vw] h-[100vh] absolute top-0 left-0 z-[99999999] bg-black/40 flex items-center justify-center'>
            <div className='w-[300px] h-[300px]  flex flex-col  items-center justify-center bg-white rounded-md'>
                <div className="loadingio-spinner-spinner-977el9wwy2v"><div className="ldio-4j5ay0xf86g">
                    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                </div></div>
                <p className='text-primaryColor text-base'>{text}</p>
            </div>

        </div>
    )
}

export default Loader