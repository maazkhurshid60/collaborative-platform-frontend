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
import { toast } from 'react-toastify';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';
interface ShareClientDocProps {
    clientId: string
    recipientId?: string
    clientEmail?: string
}

const ShareClientDoc: React.FC<ShareClientDocProps> = ({ clientId, recipientId, clientEmail }) => {
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
            setSharedDocsId(prev => (prev ?? []).filter(id => id !== id));
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

    console.log("<<<<<<<<<<<<<<shared doc", documentData);


    return (<div>
        {isShowModal && recipientId && <ClientDocShareModal sharedDocs={sharedDocs} clientId={clientId} providerId={providerId} sharedDocsId={sharedDocsId} recipientId={recipientId} clientEmail={clientEmail} />}
        {isClientCompleteDocModal && <ClientCompleteDocShareModal completedDoc={selectedCompletedDoc} clientId={clientId} />}
        <div className='relative pl-2'>

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Needs to be Shared</p>
                <div className='w-[95px]'>

                    <Button text='Share' sm onclick={() => (sharedDocs && sharedDocs.length > 0) ? dispatch(isModalShowReducser(true)) : toast.warn("First Select Document")} icon={<FaRegShareFromSquare />} />
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
                <p className='font-semibold text-[14px] '>Shared Documents</p>

            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {documentData?.sharedDocuments && documentData?.sharedDocuments?.length > 0 ? documentData?.sharedDocuments?.map((data: Document) => <div className='cursor-pointer flex items-center gap-x-3 font-medium text-[14px] '
                    onClick={() => { dispatch(isClientCompleteDocModalReducer(true)); setSelectedCompletedDoc(data); }}
                > <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data?.name}</div>)
                    : <NoRecordFound />
                }
            </div>

            <hr className='text-textGreyColor/30 h-[2px] mt-10 mb-10' />

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Completed Documents</p>

            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {documentData?.completedDocuments && documentData?.completedDocuments?.length > 0 ? documentData?.completedDocuments?.map((data: Document) => <div className='cursor-pointer flex items-center gap-x-3 font-medium text-[14px] '
                    onClick={() => { dispatch(isClientCompleteDocModalReducer(true)); setSelectedCompletedDoc(data); }}
                > <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data?.name}</div>)
                    : <NoRecordFound />
                }
            </div>
        </div>
    </div>
    )
}

export default ShareClientDoc













































// import React, { useState } from 'react'

// import Button from '../../../button/Button'
// import { IoDocumentTextOutline } from "react-icons/io5";
// import ClientDocShareModal from '../../../modals/providerModal/clientDocShareModal/ClientDocShareModal';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../../../redux/store';
// import { isClientCompleteDocModalReducer, isModalShowReducser } from '../../../../redux/slices/ModalSlice';
// import { FaRegShareFromSquare } from "react-icons/fa6";
// import Checkbox from '../../../checkbox/Checkbox';
// import { useQuery } from '@tanstack/react-query';
// import { Document, DocumentResponseType } from '../../../../types/documentType/DocumentType';
// import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
// import ClientCompleteDocShareModal from '../../../modals/providerModal/clientDocShareModal/ClientCompleteDocShareModal';
// import { toast } from 'react-toastify';
// interface ShareClientDocProps {
//     clientId: string
//     recipientId?: string
//     clientEmail?: string
// }

// const ShareClientDoc: React.FC<ShareClientDocProps> = ({ clientId, recipientId, clientEmail }) => {
//     const dispatch = useDispatch<AppDispatch>()
//     const [sharedDocs, setSharedDocs] = useState<string[]>()
//     const [sharedDocsId, setSharedDocsId] = useState<string[]>([])

//     const isShowModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
//     const isClientCompleteDocModal = useSelector((state: RootState) => state.modalSlice.isClientCompleteDocModal)
//     const providerId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)
//     const [selectedCompletedDoc, setSelectedCompletedDoc] = useState<Document | undefined>(undefined);

//     const selectDoc = (docName: string, isChecked: boolean, id: string) => {
//         if (isChecked) {
//             setSharedDocs(prev => [...(prev ?? []), docName]);
//             setSharedDocsId(prev => [...(prev ?? []), id])
//         } else {
//             setSharedDocs(prev => (prev ?? []).filter(doc => doc !== docName));
//         }
//     };

//     const docShareFunction = async () => {
//         const dataSendToBackend = {
//             providerId: providerId,
//             clientId: clientId,
//             documentId: sharedDocsId,
//             recipientId: recipientId!,
//             senderId: providerId,
//             clientEmail: clientEmail,
//             title: "Document has shared"
//         };

//         try {
//             await documentApiService.documentSharedWithClientApi(dataSendToBackend);
//             toast.success("Documents shared successfully!");
//             dispatch(isModalShowReducser(false));

//             // ❗ Clear the shared documents
//             setSharedDocs([]);
//             setSharedDocsId([]);
//         } catch (err) {
//             console.log(err);

//             toast.error("Failed to share documents.");
//         }
//     };

//     const { data: documentData } = useQuery<DocumentResponseType>({
//         queryKey: ["documents"],
//         queryFn: async () => {
//             try {
//                 const response = await documentApiService.getAllDocuments(clientId);


//                 return response?.data?.data; // Ensure it always returns an array


//             } catch (error) {
//                 console.error("Error fetching client:", error);
//                 return []; // Return an empty array in case of an error
//             }
//         }

//     })

//     return (<div>
//         {isShowModal && recipientId && (
//             <ClientDocShareModal
//                 sharedDocs={sharedDocs}
//                 clientId={clientId}
//                 providerId={providerId}
//                 sharedDocsId={sharedDocsId}
//                 recipientId={recipientId}
//                 clientEmail={clientEmail}
//                 onSend={docShareFunction}
//             />
//         )}        {isClientCompleteDocModal && <ClientCompleteDocShareModal completedDoc={selectedCompletedDoc} clientId={clientId} />}
//         <div className='relative pl-2'>

//             <div className='mt-8 flex items-center justify-between mb-2' >
//                 <p className='font-semibold text-[14px] '>Needs to be Completed</p>
//                 <div className='w-[95px]'>

//                     <Button text='Share' sm onclick={() => (sharedDocs && sharedDocs.length > 0) ? dispatch(isModalShowReducser(true)) : toast.warn("First Select Document")} icon={<FaRegShareFromSquare />} />
//                 </div>
//             </div>
//             <div className='grid  grid-cols-1 sm:grid-cols-2 gap-y-3'>
//                 {documentData?.uncompletedDocuments?.map((data: Document) => (
//                     <div key={data.name} className='flex items-center gap-x-3 font-medium text-[14px]'>


//                         <Checkbox
//                             onChange={(e) => selectDoc(data.name, e.target.checked, data.id)}
//                             checked={sharedDocs?.includes(data.name) ?? false}

//                         />
//                         <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />
//                         {data?.name}
//                     </div>
//                 ))}
//             </div>

//             <hr className='text-textGreyColor/30 h-[2px] mt-10 mb-10' />

//             <div className='mt-8 flex items-center justify-between mb-2' >
//                 <p className='font-semibold text-[14px] '>Completed Documents</p>

//             </div>
//             <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3'>
//                 {documentData?.completedDocuments?.map((data: Document) => <div className='cursor-pointer flex items-center gap-x-3 font-medium text-[14px] '
//                     onClick={() => { dispatch(isClientCompleteDocModalReducer(true)); setSelectedCompletedDoc(data); }}
//                 > <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data?.name}</div>)}
//             </div>
//         </div>
//     </div>
//     )
// }

// export default ShareClientDoc





// [ '7c283302-6ee2-434a-8ce6-ae83515d59d0' ] 2ccda276-41ed-4c94-8764-89371c6924f5 477a15be-f11d-412f-a96d-bbcc37504553
// [
//   '7c283302-6ee2-434a-8ce6-ae83515d59d0',
//   'f436bcbe-176a-4da5-bf77-7c872d99e1d2'
// ] 2ccda276-41ed-4c94-8764-89371c6924f5 477a15be-f11d-412f-a96d-bbcc37504553