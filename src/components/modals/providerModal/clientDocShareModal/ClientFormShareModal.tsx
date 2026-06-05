import React from "react";
import ModalLayout from "../../modalLayout/ModalLayout";
import Button from "../../../button/Button";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { isModalShowReducser } from "../../../../redux/slices/ModalSlice";
import InputFieldOnlyRead from "../../../inputField/InputFieldOnlyRead";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../apiServices/axiosInstance/AxiosInstance";
import { toast } from "react-toastify";

interface ClientFormShareModalProps {
  sharedDocs?: string[] | undefined;
  providerId: string;
  clientId: string;
  sharedDocsId: string[];
  clientEmail?: string;
}

const ClientFormShareModal: React.FC<ClientFormShareModalProps> = ({
  sharedDocs,
  providerId,
  clientId,
  sharedDocsId,
  clientEmail,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async () => {
      // Share all selected form templates one by one
      const promises = sharedDocsId.map((id) =>
        axiosInstance.post("/form/share", {
          templateId: id,
          clientId: clientId,
          providerId: providerId,
          expirationDays: 7,
        }),
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Forms shared successfully!");
      queryClient.invalidateQueries({ queryKey: ["formTemplates"] });
      dispatch(isModalShowReducser(false));
    },
    onError: (error: any) => {
      console.error("Error sharing forms:", error);
      toast.error(error?.response?.data?.error || "Failed to share forms");
    },
  });

  const modalBody = (
    <div className="mt-4">
      <p className="text-[14px] text-textGreyColor mb-4">
        Form Templates can be shared with clients via email for review and
        completion.
      </p>
      <InputFieldOnlyRead placeHolder="user@gmail.com" value={clientEmail} />
      <p className="font-semibold text-[14px] mt-4 mb-4">Selected Forms</p>
      <div className="grid grid-cols-1 gap-3 mb-4">
        {sharedDocs?.map((data) => (
          <div
            key={data}
            className="flex items-center gap-x-3 font-medium text-[14px] min-w-0"
          >
            <IoDocumentTextOutline className="text-primaryColorDark text-2xl shrink-0" />
            <span className="truncate">{data}</span>
          </div>
        ))}
      </div>
      <Button
        text="Send"
        sm
        onclick={() => shareMutation.mutate()}
        isLoading={shareMutation.isPending}
        disabled={shareMutation.isPending}
      />
    </div>
  );

  return (
    <ModalLayout
      heading="Share forms with clients"
      modalBodyContent={modalBody}
    />
  );
};

export default ClientFormShareModal;
