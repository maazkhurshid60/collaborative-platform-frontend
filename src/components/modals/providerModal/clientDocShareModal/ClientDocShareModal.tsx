
import ModalLayout from '../../modalLayout/ModalLayout'
import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { IoDocumentTextOutline } from 'react-icons/io5'
import documentApiService from '../../../../apiServices/documentApi/DocumentApi'

interface ClientDocShareModalProps {
    sharedDocs?: string[] | undefined
    providerId: string
    clientId: string
    sharedDocsId: string[]
}
export const modalBodyContent = (docs: string[], providerId: string, clientId: string, sharedDocsId: string[]) => {
    const dataSendToBackend = {
        providerId: providerId,
        clientId: clientId,
        documentId: sharedDocsId
    }
    console.log("dataSendToBackend", dataSendToBackend);


    const docShareFunction = async () => {
        const response = await documentApiService.documentSharedWithClientApi(dataSendToBackend)
        console.log("response", response);

    }

    return <div className='mt-4'>
        <p className='text-[14px] text-textGreyColor  mb-4'>Share the documents with client to get their consent by sending them the following documents via email.</p>
        <InputField placeHolder='user@gmail.com' />
        <p className='font-semibold text-[14px] mt-4 mb-4'>Selected Documents</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 mb-4'>
            {docs?.map(data => <div className=' flex items-center gap-x-3 font-medium text-[14px] '> <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data}</div>)}
        </div>
        <Button text='Send' sm onclick={docShareFunction} />
    </div>
}

const ClientDocShareModal: React.FC<ClientDocShareModalProps> = ({ sharedDocs, providerId, clientId, sharedDocsId }) => {
    return (
        <ModalLayout heading='Share the documents with clients' modalBodyContent={modalBodyContent(sharedDocs ?? [], providerId, clientId, sharedDocsId)} />
    )
}

export default ClientDocShareModal