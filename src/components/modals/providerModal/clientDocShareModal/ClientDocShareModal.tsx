
import ModalLayout from '../../modalLayout/ModalLayout'
import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { IoDocumentTextOutline } from 'react-icons/io5'

interface ClientDocShareModalProps {
    sharedDocs?: string[]
}
export const modalBodyContent = (docs: string[]) => {
    return <div className='mt-4'>
        <p className='text-[14px] text-textGreyColor  mb-4'>Share the documents with client to get their consent by sending them the following documents via email.</p>
        <InputField placeHolder='user@gmail.com' />
        <p className='font-semibold text-[14px] mt-4 mb-4'>Selected Documents</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 mb-4'>
            {docs?.map(data => <div className=' flex items-center gap-x-3 font-medium text-[14px] '> <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data}</div>)}
        </div>
        <Button text='Send' sm />
    </div>
}

const ClientDocShareModal: React.FC<ClientDocShareModalProps> = ({ sharedDocs }) => {
    return (
        <ModalLayout heading='Share the documents with clients' modalBodyContent={modalBodyContent(sharedDocs ?? [])} />
    )
}

export default ClientDocShareModal