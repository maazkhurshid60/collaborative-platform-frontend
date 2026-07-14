// GroupSettingsModalBody.tsx
//
// Creator-only group settings. Today the only setting is the
// `membersCanInvite` toggle — when off, only the creator can add
// members or send invites. The backend enforces this too; this UI
// just lets the creator flip the bit.

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { FiLock, FiUnlock } from "react-icons/fi";

import Button from "../../../button/Button";
import chatApiService from "../../../../apiServices/chatApi/ChatApi";
import { isGroupSettingsModalReducer } from "../../../../redux/slices/ModalSlice";
import { AppDispatch } from "../../../../redux/store";

interface GroupSettingsModalBodyProps {
    groupId?: string;
    /** Initial value of `membersCanInvite` — used to seed the toggle. */
    membersCanInvite?: boolean;
}

const GroupSettingsModalBody: React.FC<GroupSettingsModalBodyProps> = ({
    groupId,
    membersCanInvite,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    // Default to `true` (any member can invite) when the prop is missing —
    // matches the backend default and avoids accidentally locking on save.
    const [allowMembers, setAllowMembers] = useState<boolean>(
        membersCanInvite ?? true
    );

    const closeModal = () => dispatch(isGroupSettingsModalReducer(false));

    const { mutate: save, isPending } = useMutation({
        mutationFn: async () => {
            if (!groupId) throw new Error("Missing group id");
            return await chatApiService.updateGroupPermissions({
                groupId,
                membersCanInvite: allowMembers,
            });
        },
        onSuccess: () => {
            toast.success(
                allowMembers
                    ? "Anyone in the group can now add members"
                    : "Only you can add members to this group now"
            );
            queryClient.invalidateQueries({ queryKey: ["groupChatchannels"] });
            closeModal();
        },
        onError: (error: unknown) => {
            let msg = "Failed to update group permissions";
            if (axios.isAxiosError(error)) {
                msg = error.response?.data?.message || msg;
            }
            toast.error(msg);
        },
    });

    return (
        <div className="p-2">
            <p className="text-[14px] font-semibold text-[#101828] mb-1">
                Member invitations
            </p>
            <p className="text-[12px] text-textGreyColor mb-4">
                Choose who can add new members or send email invites to this group.
            </p>

            {/* Two stacked cards — one selected at a time. Bigger hit areas
                than a checkbox + radio combo so it reads as a clear choice. */}
            <div className="flex flex-col gap-y-3">
                <button
                    type="button"
                    onClick={() => setAllowMembers(true)}
                    className={`flex items-start gap-x-3 p-4 rounded-md border-2 text-left cursor-pointer transition-colors ${
                        allowMembers
                            ? "border-primaryColorDark bg-primaryColorDark/5"
                            : "border-lightGreyColor hover:bg-gray-50"
                    }`}
                >
                    <div
                        className={`mt-0.5 ${
                            allowMembers ? "text-primaryColorDark" : "text-textGreyColor"
                        }`}
                    >
                        <FiUnlock size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-[14px] text-[#101828]">
                            Anyone in the group can invite
                        </p>
                        <p className="text-[12px] text-textGreyColor mt-0.5">
                            All members see the "Add Member" and "Invite" buttons.
                        </p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setAllowMembers(false)}
                    className={`flex items-start gap-x-3 p-4 rounded-md border-2 text-left cursor-pointer transition-colors ${
                        !allowMembers
                            ? "border-primaryColorDark bg-primaryColorDark/5"
                            : "border-lightGreyColor hover:bg-gray-50"
                    }`}
                >
                    <div
                        className={`mt-0.5 ${
                            !allowMembers ? "text-primaryColorDark" : "text-textGreyColor"
                        }`}
                    >
                        <FiLock size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-[14px] text-[#101828]">
                            Only I can invite
                        </p>
                        <p className="text-[12px] text-textGreyColor mt-0.5">
                            Other members can chat as usual but can't add or invite anyone.
                        </p>
                    </div>
                </button>
            </div>

            <div className="mt-6 flex justify-end">
                <div className="w-[140px]">
                    <Button
                        text="Save"
                        sm
                        onclick={() => save()}
                        isLoading={isPending}
                        disabled={isPending || !groupId}
                    />
                </div>
            </div>
        </div>
    );
};

export default GroupSettingsModalBody;
