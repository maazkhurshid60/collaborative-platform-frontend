// AddMembersToGroupModalBody.tsx
//
// Direct-add platform providers to an existing group chat. Sibling to the
// existing `InviteToGroupModalBody` (email-invite flow) — kept separate so
// the email path stays untouched while this adds a friction-free option for
// providers who are already on the platform.
//
// Mirrors the picker UX from `NewGroupChatModal`: list of providers with
// search and a per-row toggle, then one "Add to Group" button at the bottom.
// We filter out: the caller themselves, anyone already in the group, and
// anyone the search query rules out.

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { FiMinusCircle } from "react-icons/fi";

import SearchBar from "../../../searchBar/SearchBar";
import Loader from "../../../loader/Loader";
import Button from "../../../button/Button";
import AddIcon from "../../../icons/add/Add";
import ToolTip from "../../../toolTip/ToolTip";
import providerApiService from "../../../../apiServices/providerApi/ProviderApi";
import chatApiService from "../../../../apiServices/chatApi/ChatApi";
import { isAddMembersToGroupModalReducer } from "../../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../../redux/store";
import { ProviderType } from "../../../../types/providerType/ProviderType";
import { GroupMember } from "../../../../types/chatType/GroupType";

interface AddMembersToGroupModalBodyProps {
    /** Group to add members to. Required for the API call to do anything. */
    groupId?: string;
    /** Existing members of the group — used to filter the picker list. */
    currentMembers?: GroupMember[];
}

const AddMembersToGroupModalBody: React.FC<AddMembersToGroupModalBodyProps> = ({
    groupId,
    currentMembers = [],
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails);
    const loginProviderId = loginUserDetail?.id;
    const loginUserId = loginUserDetail?.user?.id;

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

    // ----- Fetch all platform providers (same source the create-group modal uses) -----
    const { data: allProviders, isLoading, isError } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            const response = await providerApiService.getAllProviders(loginUserId ?? "");
            return response?.data?.providers ?? [];
        },
        enabled: Boolean(loginUserId),
    });

    // ----- Build the eligibility set: who's already in the group -----
    // The GroupMember rows carry `userId`. ProviderType has both `id` (Provider
    // record id) and `userId` — we compare on userId so the dedupe is correct.
    const existingMemberUserIds = useMemo(() => {
        const set = new Set<string>();
        for (const m of currentMembers) {
            const userId = (m as any)?.userId ?? (m as any)?.user?.id ?? (m as any)?.Provider?.user?.id;
            if (userId) set.add(userId);
        }
        // Also exclude the caller — they're obviously already in the group.
        if (loginUserId) set.add(loginUserId);
        return set;
    }, [currentMembers, loginUserId]);

    const eligibleProviders = useMemo(() => {
        if (!allProviders) return [];
        const term = searchQuery.trim().toLowerCase();
        return allProviders.filter((p) => {
            if (!p?.id) return false;
            // Skip if already a group member (or the caller themselves)
            const userId = (p as any)?.userId ?? p?.user?.id;
            if (userId && existingMemberUserIds.has(userId)) return false;
            // Skip the caller's Provider record id too as a belt-and-braces check
            if (loginProviderId && p.id === loginProviderId) return false;
            if (!term) return true;
            return p?.user?.fullName?.toLowerCase().includes(term);
        });
    }, [allProviders, existingMemberUserIds, loginProviderId, searchQuery]);

    const toggleSelect = (providerId: string) => {
        setSelectedProviderIds((prev) =>
            prev.includes(providerId)
                ? prev.filter((id) => id !== providerId)
                : [...prev, providerId]
        );
    };

    const closeModal = () => {
        dispatch(isAddMembersToGroupModalReducer(false));
    };

    const { mutate: addMembers, isPending } = useMutation({

        mutationFn: async () => {
            if (!groupId) throw new Error("Missing group id");
            return await chatApiService.addProvidersToGroup({
                groupId,
                providerIds: selectedProviderIds,
            });
        },
        onSuccess: (response: any) => {
            // Backend returns { addedCount, skippedCount, addedNames, groupId }
            // wrapped by ApiResponse. Account for both shapes.
            const data = response?.data ?? response;
            const addedNames: string[] = Array.isArray(data?.addedNames) ? data.addedNames : [];
            const addedCount: number = data?.addedCount ?? selectedProviderIds.length;

            const formatNames = (names: string[]) =>
                names.length <= 3
                    ? names.join(", ")
                    : `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;

            toast.success(
                addedNames.length > 0
                    ? `Added ${formatNames(addedNames)} to the group`
                    : `Added ${addedCount} member${addedCount === 1 ? "" : "s"} to the group`
            );

            queryClient.invalidateQueries({ queryKey: ["groupChatchannels"] });
            queryClient.invalidateQueries({ queryKey: ["chatchannels"] });
            closeModal();
        },
        onError: (error: unknown) => {
            let errorMessage = "Failed to add members. Please try again.";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProviderIds.length === 0) {
            toast.warn("Select at least one provider to add");
            return;
        }
        if (!groupId) {
            toast.error("Group not loaded yet — please try again");
            return;
        }
        addMembers();
    };

    if (isLoading) return <Loader text="Loading providers..." />;
    if (isError) return <p className="p-4 text-redColor">Failed to load providers.</p>;

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <p className="text-[13px] text-textGreyColor mb-3">
                Pick providers already on the platform to add to this group. They
                won't receive an email — they'll just see the group appear in
                their chat list. Already-in-group providers are hidden.
            </p>

            <div className="mb-3">
                <SearchBar
                    sm
                    bgColor="bg-inputBgColor"
                    isBorder={false}
                    borderRounded="rounded-[8px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search providers..."
                />
            </div>

            <div className="max-h-[320px] overflow-y-auto px-2 pt-2 pb-1">
                {eligibleProviders.length === 0 ? (
                    <p className="text-[13px] text-textGreyColor py-6 text-center">
                        {searchQuery
                            ? "No matching providers."
                            : "Everyone on the platform is already in this group."}
                    </p>
                ) : (
                    eligibleProviders.map((provider) => {
                        const isSelected = selectedProviderIds.includes(provider.id!);
                        return (
                            <div
                                className="flex items-center justify-between gap-x-3 w-auto rounded-md hover:bg-primaryColorLight p-2"
                                key={provider.id}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="capitalize text-[14px] font-medium truncate">
                                        {provider?.user?.fullName || "Unnamed Provider"}
                                    </p>
                                    {provider?.user?.email && (
                                        <p className="text-[12px] text-textGreyColor lowercase truncate">
                                            {provider.user.email}
                                        </p>
                                    )}
                                </div>
                                {isSelected ? (
                                    <div className="relative group w-fit">
                                        <FiMinusCircle
                                            className="cursor-pointer text-xl text-textGreyColor"
                                            onClick={() => toggleSelect(provider.id!)}
                                        />
                                        <ToolTip toolTipText="Remove" />
                                    </div>
                                ) : (
                                    <div className="relative group w-fit">
                                        <AddIcon
                                            className="cursor-pointer"
                                            onClick={() => toggleSelect(provider.id!)}
                                        />
                                        <ToolTip toolTipText="Add to group" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4">
                <Button
                    text={
                        selectedProviderIds.length > 0
                            ? `Add ${selectedProviderIds.length} to Group`
                            : "Add to Group"
                    }
                    sm
                    isLoading={isPending}
                    disabled={isPending || selectedProviderIds.length === 0 || !groupId}
                />
            </div>
        </form>
    );
};

export default AddMembersToGroupModalBody;
