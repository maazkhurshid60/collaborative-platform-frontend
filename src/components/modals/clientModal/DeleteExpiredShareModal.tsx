import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import axiosInstance from "@/apiServices/axiosInstance/AxiosInstance";
import Button from "@/components/button/Button";
import ModalLayout from "@/components/modals/modalLayout/ModalLayout";
import { showAPIError } from "@/utils/errorUtils";

interface DeleteExpiredShareModalProps {
  shareId: string;
  documentName: string;
  clientId: string;
  onClose: () => void;
}

const DeleteExpiredShareModal: React.FC<DeleteExpiredShareModalProps> = ({
  shareId,
  documentName,
  clientId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const { mutate: deleteDocument, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(`/form/share/${shareId}/expired`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Expired document removed successfully.", {
        position: "bottom-right",
        autoClose: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["shared-forms", clientId] });
      onClose();
    },
    onError: showAPIError,
  });

  const modalBody = (
    <div className="w-full m-auto">
      <p className="text-center mt-10 text-[16px] font-medium">
        Are you sure you want to delete this expired document?
      </p>

      {documentName && (
        <p className="text-center text-sm text-gray-500 font-semibold mt-1">
          "{documentName}"
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed max-w-xs mx-auto">
        This link has expired and the form was never submitted. It will be
        permanently removed from your documents list.
      </p>

      <div className="flex items-center justify-center gap-x-4 mt-10">
        <div className="w-full">
          <Button
            text="Cancel"
            borderButton
            onclick={onClose}
            disabled={isPending}
          />
        </div>
        <div className="w-full">
          <Button
            text="Delete"
            onclick={() => deleteDocument()}
            isLoading={isPending}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModalLayout
      heading="Delete Expired Document"
      modalBodyContent={modalBody}
      onClose={onClose}
      widthClass="w-[90%] md:w-[45%] lg:w-[35%]"
    />
  );
};

export default DeleteExpiredShareModal;
