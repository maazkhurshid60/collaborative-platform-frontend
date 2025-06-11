import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useState } from 'react';
import { toast } from 'react-toastify';
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import UploadFile from '../../../inputField/UploadFile';
import Checkbox from '../../../checkbox/Checkbox';
import { documentSignByClientType } from '../../../../types/documentType/DocumentType';
import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import CrossIcon from '../../../icons/cross/Cross';

interface ViewDocModalProps {
    sharedDocs?: string
    data: documentSignByClientType
}


const ModalBodyContent: React.FC<{ docs: string, data: documentSignByClientType }> = ({ docs, data }) => {
    const [isAgree, setIsAgree] = useState(false);
    const dispatch = useDispatch<AppDispatch>()
    const [signAdd, setSignAdd] = useState<string | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    // --- useMutation hook ---
    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            documentApiService.documentSignByClientApi(formData);
            // const notificationSendToBackend = {
            //     recipientId: data?.recipientId,
            //     title: "Document Shared",
            //     type: "DOCUMENT_SHARED",
            //     senderId: senderId
            // }
            // await notificationApiService.sendNotification(notificationSendToBackend)
        },
        onSuccess: () => {
            toast.success("Document signed successfully!");
            queryClient.invalidateQueries({ queryKey: ['documents'] }); // Adjust key to match your app
            dispatch(isModalShowReducser(false));
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<{ error: string }>;
            const errorMessage = axiosError.response?.data?.error || "Something went wrong";
            toast.error(errorMessage);
        }
    });
    const submitFunction = async () => {
        if (!isAgree) {
            toast.error("Please agree to the terms and conditions.");
            return;
        }
        if (!signatureFile) {
            toast.error("Please upload your signature.");
            return;
        }

        const formData = new FormData();
        formData.append("isAgree", String(isAgree));
        formData.append("eSignature", signatureFile);
        formData.append("clientId", data?.clientId);
        formData.append("sharedDocumentId", data?.documentId);
        formData.append("senderId", senderId);
        mutation.mutate(formData);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSignAdd(imageUrl); // for preview
            setSignatureFile(file); // for uploading
        }
    };

    return (
        <div className='mt-4'>
            <div className='h-[300px]  overflow-auto'>

                <div className="p-4 text-textColor" dangerouslySetInnerHTML={{ __html: docs }} />

            </div>
            <div className='mt-4 mb-4'>
                <div className='flex items-center gap-x-2.5'>

                    <Checkbox
                        text="I agree to the terms and condition mentioned above."
                        onChange={() => setIsAgree(!isAgree)}
                        checked={isAgree}
                    />
                </div>


            </div>
            {signAdd ? <div className='relative'> <img
                src={signAdd}
                alt="Signature"
                className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
            />
                <CrossIcon onClick={() => setSignAdd(null)} />
            </div> :
                <UploadFile onChange={handleFileChange} text='Add your signature here' heading='Sign here' />

            }

            <Button text='Submit' sm onclick={submitFunction} />
        </div>
    );
};

const ViewDocModal: React.FC<ViewDocModalProps> = ({ sharedDocs, data }) => {
    return (
        <ModalLayout
            heading='Privacy Policy Consent'
            modalBodyContent={<ModalBodyContent docs={sharedDocs ?? ""} data={data} />}
        />
    );
};

export default ViewDocModal;
