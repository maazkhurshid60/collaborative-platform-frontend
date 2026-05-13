import { FC } from "react";
import ModalLayout from "../modalLayout/ModalLayout";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import { toast } from "react-toastify";
import Button from "@/components/button/Button";

interface DeleteLogModalProps {
    logId?: string | null;
    logIds?: string[];
    onSuccess?: () => void;
}

const DeleteLogModal: FC<DeleteLogModalProps> = ({ logId, logIds, onSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    const isBulk = Array.isArray(logIds) && logIds.length > 0;

    const mutation = useMutation({
        mutationFn: () => {
            if (isBulk) {
                return superAdminApi.bulkDeleteAuditLogs(logIds);
            }
            return superAdminApi.deleteAuditLog(logId!);
        },
        onSuccess: () => {
            toast.success(isBulk ? `${logIds.length} audit logs deleted successfully` : "Audit log deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
            if (onSuccess) onSuccess();
            dispatch(isModalDeleteReducer(false));
        },
        onError: (error: any) => {
            const errMsg = error?.response?.data?.message || "Something went wrong";
            toast.error(errMsg);
        }
    });

    const modalBody = (
        <div className="flex flex-col gap-y-4">
            <div className="w-full m-auto text-center">
                <p className="text-gray-500 text-sm">
                    {isBulk 
                        ? `Are you sure you want to delete ${logIds.length} selected audit logs? This action is permanent and cannot be reversed.`
                        : "Are you sure you want to delete this specific audit log? This action is permanent and cannot be reversed."
                    }
                </p>
            </div>
            <div className="flex items-center justify-center gap-x-4 mt-8">
                <div className="w-full">
                    <Button
                        text="Cancel"
                        borderButton
                        onclick={() => dispatch(isModalDeleteReducer(false))}
                        disabled={mutation.isPending}
                        sm
                    />
                </div>
                <div className="w-full">
                    <Button
                        text="Delete"
                        onclick={() => mutation.mutate()}
                        isLoading={mutation.isPending}
                        disabled={mutation.isPending}
                        sm
                    />
                </div>
            </div>
        </div>
    );

    return <ModalLayout heading={isBulk ? "Confirm Bulk Deletion" : "Confirm Deletion"} modalBodyContent={modalBody} />;
};

export default DeleteLogModal;
