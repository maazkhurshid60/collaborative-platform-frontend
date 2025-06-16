
import ModalLayout from '../../modalLayout/ModalLayout'
import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { IoDocumentTextOutline } from 'react-icons/io5'
import documentApiService from '../../../../apiServices/documentApi/DocumentApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice'
import { useState } from 'react'
import Loader from '../../../loader/Loader'


interface ClientDocShareModalProps {
    sharedDocs?: string[] | undefined
    providerId: string
    clientId: string
    sharedDocsId: string[]
    recipientId: string
    clientEmail?: string

}
export const modalBodyContent = (docs: string[], providerId: string, clientId: string, sharedDocsId: string[], dispatch: AppDispatch, recipientId: string, senderId: string, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    , clientEmail?: string,) => {


    const dataSendToBackend = {
        providerId: providerId,
        clientId: clientId,
        documentId: sharedDocsId,
        recipientId: recipientId,
        senderId: senderId,
        clientEmail: clientEmail,
        title: "Document has shared"
    }


    const docShareFunction = async () => {
        setIsLoading(true)
        try {
            await documentApiService.documentSharedWithClientApi(dataSendToBackend)
            // Send notification to client
            // const notificationSendToBackend = {
            //     recipientId: "f938f20a-a8fb-4b12-bc35-13b8f92ff88a", // userId of client
            //     title: "Document Shared",
            //     type: "DOCUMENT_SHARED",
            //     senderId: senderId
            // }
            // await notificationApiService.sendNotification(notificationSendToBackend);
            dispatch(isModalShowReducser(false))

        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false)
        }


    }

    return <div className='mt-4'>
        <p className='text-[14px] text-textGreyColor  mb-4'>Share the documents with client to get their consent by sending them the following documents via email.</p>
        <InputField placeHolder='user@gmail.com' value={clientEmail} readOnly />
        <p className='font-semibold text-[14px] mt-4 mb-4'>Selected Documents</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 mb-4'>
            {docs?.map(data => <div className=' flex items-center gap-x-3 font-medium text-[14px] '> <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data}</div>)}
        </div>
        <Button text='Send' sm onclick={docShareFunction} />
    </div>
}

const ClientDocShareModal: React.FC<ClientDocShareModalProps> = ({ sharedDocs, providerId, clientId, sharedDocsId, recipientId, clientEmail }) => {
    const dispatch = useDispatch<AppDispatch>()
    const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
    const [isLoading, setIsLoading] = useState<boolean>(false)


    return (
        <>
            {isLoading && <Loader />}
            <ModalLayout heading='Share the documents with clients' modalBodyContent={modalBodyContent(sharedDocs ?? [], providerId, clientId, sharedDocsId, dispatch, recipientId, senderId, setIsLoading, clientEmail)} />
        </>
    )
}

export default ClientDocShareModal