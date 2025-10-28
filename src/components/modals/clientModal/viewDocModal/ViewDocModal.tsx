import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    isModalShowReducser,
    //  isshowSignedDocumentModalClientPortalReducer 
} from '../../../../redux/slices/ModalSlice';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
// import UploadFile from '../../../inputField/UploadFile';
import Checkbox from '../../../checkbox/Checkbox';
import { documentSignByClientType } from '../../../../types/documentType/DocumentType';
import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
// import CrossIcon from '../../../icons/cross/Cross';
// import { baseUrl } from '../../../../apiServices/baseUrl/BaseUrl';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../loader/Loader';

interface ViewDocModalProps {
    sharedDocs?: string
    data: documentSignByClientType
    isOnlyRead?: boolean
}


const ModalBodyContent: React.FC<{ docs: string, data: documentSignByClientType, isOnlyRead: boolean }> = ({ docs, data, isOnlyRead }) => {
    const [isAgree, setIsAgree] = useState(false);
    const dispatch = useDispatch<AppDispatch>()
    const [isLoading, setIsLoading] = useState(false); // Define loading state

    // const [signAdd, setSignAdd] = useState<string | null>(null);
    // const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
    const isESignature = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.eSignature)
    const navigate = useNavigate()

    console.log("isESignature", isESignature);

    // --- useMutation hook ---
    const mutation = useMutation({
        mutationFn: async (formData: {
            isAgree: boolean;
            eSignature: string;
            clientId?: string;
            sharedDocumentId?: string;
            senderId?: string;
        }) => {
            return documentApiService.documentSignByClientApi(formData);

        },
        onSuccess: () => {
            toast.success("Document signed successfully!");
            queryClient.invalidateQueries({ queryKey: ['documents'] }); // Adjust key to match your app
            setIsLoading(false);
            dispatch(isModalShowReducser(false));
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<{ error: string }>;
            setIsLoading(false);
            const errorMessage = axiosError.response?.data?.error || "Something went wrong";
            toast.error(errorMessage);
        }
    });
    const submitFunction = async () => {
        if (!isAgree) {
            toast.error("Please agree to the terms and conditions.");
            return;
        }
        if (!isESignature || isESignature === "null" || isESignature === null) {
            toast.error("Please upload your signature.");
            return;
        }

        const formData = {
            isAgree: isAgree,
            eSignature: isESignature,
            clientId: data?.clientId,
            sharedDocumentId: data?.documentId,
            senderId: senderId
        }
        setIsLoading(true);
        mutation.mutate(formData);
    };
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         const imageUrl = URL.createObjectURL(file);
    //         setSignAdd(imageUrl); // for preview
    //         setSignatureFile(file); // for uploading
    //     }
    // };
    console.log("isESignature", isESignature === "null");

    return (
        <>
            {isLoading && <Loader />}
            <div className='mt-4'>
                <div className='h-[300px]  overflow-auto'>

                    <div className="p-4 text-textColor" dangerouslySetInnerHTML={{ __html: docs }} />

                </div>
                {!isOnlyRead &&
                    <>
                        <div className='mt-4 mb-4'>
                            <div className='flex items-center gap-x-2.5'>

                                <Checkbox
                                    text="I agree to the terms and condition mentioned above."
                                    onChange={() => setIsAgree(!isAgree)}
                                    checked={isAgree}
                                />
                            </div>


                        </div>
                        {/* {signAdd ? <div className='relative'> <img
                        src={signAdd}
                        alt="Signature"
                        className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
                    />
                        <CrossIcon onClick={() => setSignAdd(null)} />
                    </div> :
                        <UploadFile onChange={handleFileChange} text='Add your signature here' heading='Sign here' />

                    } */}

                        {isESignature !== null && isESignature !== "null" ?
                            <div className='relative'> <img
                                src={isESignature}
                                alt="Signature"
                                className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
                            />
                            </div>
                            : <p className='text-red-600 mb-4'>First Upload E-Signature on Your Account. To Upload please Click <span className='cursor-pointer font-bold'
                                onClick={() => {
                                    dispatch(isModalShowReducser(false));
                                    navigate(`/settings`);
                                }
                                }>
                                Here</span> </p>
                        }

                        <Button text='Submit' sm onclick={submitFunction} />
                    </>
                }
            </div >
        </>

    );
};

const ViewDocModal: React.FC<ViewDocModalProps> = ({ sharedDocs, data, isOnlyRead = false }) => {
    return (
        <>

            <ModalLayout
                heading='Privacy Policy Consent'
                modalBodyContent={<ModalBodyContent docs={sharedDocs ?? ""} data={data} isOnlyRead={isOnlyRead} />}
            />
        </>
    );
};

export default ViewDocModal;
