import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice';
import { AppDispatch } from '../../../../redux/store';
import Button from '../../../button/Button';
import ModalLayout from '../../modalLayout/ModalLayout';
import loginUserApiService from '../../../../apiServices/loginUserApi/LoginUserApi';

interface DeleteAccountModalProps {
    userId: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ userId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => loginUserApiService.deleteMeApi(userId),
        onSuccess: () => {
            toast.success("Account deleted successfully");
            dispatch(isModalDeleteReducer(false));
            queryClient.invalidateQueries({ queryKey: ['user'] }); // 🔁 Refetch user data
        },
        onError: () => {
            toast.error("Failed to delete account");
        }
    });

    const modalBody = (
        <div className="w-full m-auto">
            <p className="text-center mt-10">
                Are you sure you want to delete this account?
            </p>
            <div className="flex items-center justify-center gap-x-4 mt-10">
                <div className="w-full">
                    <Button
                        text="Cancel"
                        borderButton
                        onclick={() => dispatch(isModalDeleteReducer(false))}
                    />
                </div>
                <div className="w-full">
                    <Button
                        text={"Delete"}
                        onclick={() => mutation.mutate()}
                    />
                </div>
            </div>
        </div>
    );

    return <ModalLayout heading="Delete Account" modalBodyContent={modalBody} />;
};

export default DeleteAccountModal;
