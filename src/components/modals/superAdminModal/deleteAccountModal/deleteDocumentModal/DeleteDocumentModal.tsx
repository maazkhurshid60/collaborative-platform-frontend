import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppDispatch } from '../../../../../redux/store';
import documentApiService from '../../../../../apiServices/documentApi/DocumentApi';
import { isModalDeleteReducer } from '../../../../../redux/slices/ModalSlice';
import Button from '../../../../button/Button';
import ModalLayout from '../../../modalLayout/ModalLayout';


interface DeleteDocumentModalProps {
    documentId: string;
}

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({ documentId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    // ✅ Mutation for deleting document
    const deleteMutation = useMutation({
        mutationFn: async () => {
            return documentApiService.deleteDocumentApi(documentId);
        },
        onSuccess: () => {
            toast.success("Document deleted successfully");
            dispatch(isModalDeleteReducer(false));
            queryClient.invalidateQueries({ queryKey: ['documents'] }); // 🔁 Refetch document list
        },
        onError: () => {
            toast.error("Failed to delete document");
        }
    });

    const modalBody = (
        <div className='w-full m-auto'>
            <p className='text-center mt-10 text-[16px] font-medium'>
                Are you sure you want to delete this document?
            </p>
            <div className='flex items-center justify-center gap-x-4 mt-10'>
                <div className='w-full'>
                    <Button
                        text='Cancel'
                        borderButton
                        onclick={() => dispatch(isModalDeleteReducer(false))}
                        disabled={deleteMutation.isPending}
                    />
                </div>
                <div className='w-full'>
                    <Button
                        text={'Delete'}
                        onclick={() => deleteMutation.mutate()}
                        isLoading={deleteMutation.isPending}
                        disabled={deleteMutation.isPending}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <ModalLayout
            heading='Delete Document'
            modalBodyContent={modalBody}
        />
    );
};

export default DeleteDocumentModal;
