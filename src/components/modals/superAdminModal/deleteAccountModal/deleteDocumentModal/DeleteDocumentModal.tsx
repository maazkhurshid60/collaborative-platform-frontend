import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppDispatch } from '../../../../../redux/store';
import documentApiService from '../../../../../apiServices/documentApi/DocumentApi';
import { isModalDeleteReducer } from '../../../../../redux/slices/ModalSlice';
import Button from '../../../../button/Button';
import ModalLayout from '../../../modalLayout/ModalLayout';


import axiosInstance from '../../../../../apiServices/axiosInstance/AxiosInstance';

interface DeleteDocumentModalProps {
    documentId: string;
    isForm?: boolean;
}

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({ documentId, isForm = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    // ✅ Mutation for deleting document or form
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (isForm) {
                const res = await axiosInstance.delete(`/form/templates/${documentId}`);
                return res.data;
            }
            return documentApiService.deleteDocumentApi(documentId);
        },
        onSuccess: () => {
            toast.success(isForm ? "Form template deleted successfully" : "Document deleted successfully");
            dispatch(isModalDeleteReducer(false));
            queryClient.invalidateQueries({ queryKey: [isForm ? 'formTemplates' : 'documents'] }); // 🔁 Refetch list
        },
        onError: () => {
            toast.error(isForm ? "Failed to delete form template" : "Failed to delete document");
        }
    });

    const modalBody = (
        <div className='w-full m-auto'>
            <p className='text-center mt-10 text-[16px] font-medium'>
                Are you sure you want to delete this {isForm ? 'form template' : 'document'}?
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
            heading={isForm ? 'Delete Form Template' : 'Delete Document'}
            modalBodyContent={modalBody}
        />
    );
};

export default DeleteDocumentModal;
