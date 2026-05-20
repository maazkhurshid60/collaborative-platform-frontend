import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { IoDocumentTextOutline } from 'react-icons/io5'
import documentApiService from '../../../../apiServices/documentApi/DocumentApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice'
import InputFieldOnlyRead from '../../../inputField/InputFieldOnlyRead'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ClientDocShareModalProps {
    sharedDocs?: string[] | undefined
    providerId: string
    clientId: string
    sharedDocsId: string[]
    recipientId: string
    clientEmail?: string
}

const ClientDocShareModal: React.FC<ClientDocShareModalProps> = ({
    sharedDocs,
    providerId,
    clientId,
    sharedDocsId,
    recipientId,
    clientEmail
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
    const queryClient = useQueryClient()

    const dataSendToBackend = {
        providerId: providerId,
        clientId: clientId,
        documentId: sharedDocsId,
        recipientId: recipientId,
        senderId: senderId,
        clientEmail: clientEmail,
        title: "Document has shared"
    }

    const shareMutation = useMutation({
        mutationFn: () => documentApiService.documentSharedWithClientApi(dataSendToBackend),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] })
            dispatch(isModalShowReducser(false))
        },
        onError: (error) => {
            console.error("Error sharing document:", error)
        }
    })

    const modalBody = (
        <div className='mt-4'>
            <p className='text-[14px] text-textGreyColor mb-4'>
                Documents can be shared with clients via email for review and consent
            </p>
            <InputFieldOnlyRead placeHolder='user@gmail.com' value={clientEmail} />
            <p className='font-semibold text-[14px] mt-4 mb-4'>Selected Documents</p>
            <div className='grid grid-cols-1 gap-3 mb-4'>
                {sharedDocs?.map(data => (
                    <div key={data} className='flex items-center gap-x-3 font-medium text-[14px] min-w-0'>
                        <IoDocumentTextOutline className='text-primaryColorDark text-2xl flex-shrink-0' />
                        <span className='truncate'>{data}</span>
                    </div>
                ))}
            </div>
            <Button
                text='Send'
                sm
                onclick={() => shareMutation.mutate()}
                isLoading={shareMutation.isPending}
                disabled={shareMutation.isPending}
            />
        </div>
    )

    return (
        <ModalLayout
            heading='Share the documents with clients'
            modalBodyContent={modalBody}
        />
    )
}

export default ClientDocShareModal