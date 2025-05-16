import React, { useState } from 'react'

import Button from '../../../button/Button'
import { IoDocumentTextOutline } from "react-icons/io5";
import ClientDocShareModal from '../../../modals/providerModal/clientDocShareModal/ClientDocShareModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { isClientCompleteDocModalReducer, isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import { FaRegShareFromSquare } from "react-icons/fa6";
import Checkbox from '../../../checkbox/Checkbox';
import { useQuery } from '@tanstack/react-query';
import { Document, DocumentResponseType } from '../../../../types/documentType/DocumentType';
import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
import ClientCompleteDocShareModal from '../../../modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal';
interface ShareClientDocProps {
    clientId: string
}

const ShareClientDoc: React.FC<ShareClientDocProps> = ({ clientId }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [sharedDocs, setSharedDocs] = useState<string[]>()
    const [sharedDocsId, setSharedDocsId] = useState<string[]>([])

    const isShowModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const isClientCompleteDocModal = useSelector((state: RootState) => state.modalSlice.isClientCompleteDocModal)
    const providerId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)
    const [selectedCompletedDoc, setSelectedCompletedDoc] = useState<Document | undefined>(undefined);

    const selectDoc = (docName: string, isChecked: boolean, id: string) => {
        if (isChecked) {
            setSharedDocs(prev => [...(prev ?? []), docName]);
            setSharedDocsId(prev => [...(prev ?? []), id])
        } else {
            setSharedDocs(prev => (prev ?? []).filter(doc => doc !== docName));
        }
    };


    const { data: documentData } = useQuery<DocumentResponseType>({
        queryKey: ["documents"],
        queryFn: async () => {
            try {
                const response = await documentApiService.getAllDocuments(clientId);


                return response?.data?.data; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
    console.log("..................................sharedDocsId..................................", sharedDocsId);


    return (<div>
        {isShowModal && <ClientDocShareModal sharedDocs={sharedDocs} clientId={clientId} providerId={providerId} sharedDocsId={sharedDocsId} />}
        {isClientCompleteDocModal && <ClientCompleteDocShareModal completedDoc={selectedCompletedDoc} clientId={clientId} />}
        <div className='relative pl-2'>

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Needs to be Completed</p>
                <div className='w-[95px]'>

                    <Button text='Share' sm onclick={() => dispatch(isModalShowReducser(true))} icon={<FaRegShareFromSquare />} />
                </div>
            </div>
            <div className='grid  grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {documentData?.uncompletedDocuments?.map((data: Document) => (
                    <div key={data.name} className='flex items-center gap-x-3 font-medium text-[14px]'>


                        <Checkbox
                            onChange={(e) => selectDoc(data.name, e.target.checked, data.id)}
                            checked={sharedDocs?.includes(data.name) ?? false}

                        />
                        <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />
                        {data?.name}
                    </div>
                ))}
            </div>

            <hr className='text-textGreyColor/30 h-[2px] mt-10 mb-10' />

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Completed Documents</p>

            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {documentData?.completedDocuments?.map((data: Document) => <div className=' flex items-center gap-x-3 font-medium text-[14px] '
                    onClick={() => { dispatch(isClientCompleteDocModalReducer(true)); setSelectedCompletedDoc(data); }}
                > <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data?.name}</div>)}
            </div>
        </div>
    </div>
    )
}

export default ShareClientDoc