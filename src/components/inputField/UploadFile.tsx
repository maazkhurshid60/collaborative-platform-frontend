import ESignatureIcon from '../icons/eSignature/ESignature'
interface UploadFileProps {
    heading?: string
    text?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const UploadFile: React.FC<UploadFileProps> = (props) => {
    return (
        <div className='bg-[#EAF5F4] p-3 rounded-[20px] mb-4 text-center'>
            <input
                type='file'
                id='signature-upload'
                style={{ display: 'none' }}
                accept='image/*'
                onChange={props.onChange}
            />


            <label htmlFor='signature-upload' className='cursor-pointer'>
                <div className='flex items-center justify-center w-full'>

                    <ESignatureIcon />
                </div>
                <p className='text-sm font-semibold mt-2'>{props.heading}</p>
                <p className='text-sm mt-2'>{props.text}</p>
            </label>


        </div>)
}

export default UploadFile