import { FC } from "react";
import ModalLayout from "../../modalLayout/ModalLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { isModalDeleteReducer } from "../../../../redux/slices/ModalSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import loginUserApiService from "../../../../apiServices/loginUserApi/LoginUserApi";
import { toast } from "react-toastify";
import Button from "../../../button/Button";

interface DeleteAccountModalProps {
    userId: string;
    role?: string;
}

const DeleteAccountModal: FC<DeleteAccountModalProps> = ({ userId, role }) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();
    const userRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.role);
    const isAdmin = userRole === "superAdmin";

    const mutation = useMutation({
        mutationFn: () => {
            if (isAdmin) {
                return loginUserApiService.deleteUserByAdminApi(userId);
            }
            return loginUserApiService.deleteMeApi(userId);
        },
        onSuccess: () => {
            toast.success("Account deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            dispatch(isModalDeleteReducer(false));
        },
        onError: (error: any) => {
            console.log("error", error);
            const errMsg = error?.response?.data?.message || "Something went wrong";
            toast.error(errMsg);
        }
    });

    const modalBody = (
        <div className="flex flex-col gap-y-4">
            <div className="w-full m-auto text-center">
                <p className="text-gray-500">
                    Are you sure you want to delete this account? This action cannot be undone.
                </p>
                {role === "provider" && isAdmin && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4 text-left">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-bold">
                                    Warning: Deleting this provider includes canceling their subscription and Stripe customer record. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-center gap-x-4 mt-10">
                <div className="w-full">
                    <Button
                        text="Cancel"
                        borderButton
                        onclick={() => dispatch(isModalDeleteReducer(false))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div className="w-full">
                    <Button
                        text="Delete"
                        onclick={() => mutation.mutate()}
                        isLoading={mutation.isPending}
                        disabled={mutation.isPending}
                    />
                </div>
            </div>
        </div>
    );

    return <ModalLayout heading="Delete Account" modalBodyContent={modalBody} />;
};

export default DeleteAccountModal;
