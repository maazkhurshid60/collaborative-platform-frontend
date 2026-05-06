
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { IoDocumentTextOutline } from "react-icons/io5";

import ModalLayout from "../../modalLayout/ModalLayout";
import Button from "../../../button/Button";
import Checkbox from "../../../checkbox/Checkbox";
import documentApiService from "../../../../apiServices/documentApi/DocumentApi";
import { isMultiClientDocShareModalReducer } from "../../../../redux/slices/ModalSlice";
import { AppDispatch } from "../../../../redux/store";
import {
    DocClientStatus,
    MasterDocument,
} from "../../../../types/documentType/DocumentType";
import { ClientType } from "../../../../types/clientType/ClientType";
import { toast } from "react-toastify";

interface MultiClientDocShareModalProps {
    selectedDocs: MasterDocument[];
    clients: ClientType[];
    providerId?: string;
    senderId?: string;
    /** Called after at least one successful share — parent can clear selection. */
    onShared?: () => void;
}

/** Status of a single (document, client) pair, derived from the master doc's sharedWith rows. */
const statusFor = (doc: MasterDocument, clientId: string | undefined): DocClientStatus => {
    if (!clientId) return "NEED_SHARE";
    const row = doc.sharedWith?.find((sw) => sw.clientId === clientId);
    if (!row) return "NEED_SHARE";
    if (row.eSignature) return "SIGNED";
    return "SHARED";
};

const ModalBody: React.FC<MultiClientDocShareModalProps> = ({
    selectedDocs,
    clients,
    providerId,
    senderId,
    onShared,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();

    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const hasUnapprovedClients = clients.some((c) => c.user?.isApprove !== "APPROVED");

    /**
     * For each client, count how many of the selected docs fall in each status.
     * Used to drive the per-row badges and disable the checkbox when there's
     * nothing left to share.
     */
    const perClientSummary = useMemo(() => {
        const map: Record<
            string,
            { needShareIds: string[]; sharedCount: number; signedCount: number }
        > = {};
        for (const client of clients) {
            const cid = client.id;
            if (!cid) continue;
            const summary = { needShareIds: [] as string[], sharedCount: 0, signedCount: 0 };
            for (const doc of selectedDocs) {
                const s = statusFor(doc, cid);
                if (s === "NEED_SHARE") summary.needShareIds.push(doc.id);
                else if (s === "SHARED") summary.sharedCount++;
                else if (s === "SIGNED") summary.signedCount++;
            }
            map[cid] = summary;
        }
        return map;
    }, [clients, selectedDocs]);

    const toggleClient = (clientId: string, checked: boolean) => {
        setSelectedClientIds((prev) =>
            checked ? [...prev, clientId] : prev.filter((id) => id !== clientId)
        );
    };

    const handleClose = () => {
        dispatch(isMultiClientDocShareModalReducer(false));
    };

    const handleSend = async () => {
        if (!providerId || !senderId) {
            toast.error("Missing provider information. Please refresh and try again.");
            return;
        }
        if (selectedClientIds.length === 0) {
            toast.warn("Select at least one client");
            return;
        }

        // Build per-client share payloads, skipping clients who already have everything.
        const payloads = selectedClientIds
            .map((clientId) => {
                const client = clients.find((c) => c.id === clientId);
                const summary = perClientSummary[clientId];
                if (!client || !summary || summary.needShareIds.length === 0) return null;
                return {
                    clientId,
                    recipientId: client.userId ?? "",
                    clientEmail: client.user?.email,
                    documentId: summary.needShareIds,
                };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null);

        if (payloads.length === 0) {
            toast.info("All selected documents are already shared with these clients");
            return;
        }

        setIsLoading(true);
        const successNames: string[] = [];
        const failNames: string[] = [];

        try {
            // Sequential to keep error reporting predictable. The number of
            // selected clients is small in practice so this is fine.
            for (const payload of payloads) {
                const client = clients.find((c) => c.id === payload.clientId);
                const displayName =
                    client?.user?.fullName?.trim() ||
                    client?.user?.email ||
                    "Unnamed client";

                // The backend controller reads `recipientId`, `senderId`,
                // `clientEmail`, and `title` to drive notification/email side
                // effects, but the shared `documentSharedWithClientType` doesn't
                // declare them. Build the payload as a wider object and cast at
                // the call site so the surrounding code stays type-checked.
                const apiPayload = {
                    providerId,
                    clientId: payload.clientId,
                    documentId: payload.documentId,
                    recipientId: payload.recipientId,
                    senderId,
                    clientEmail: payload.clientEmail,
                    title: "Document has shared",
                };

                try {
                    // `silent: true` — we own the toast here so we can name the
                    // recipients in a single aggregated message instead of
                    // letting the API service fire one toast per call.
                    await documentApiService.documentSharedWithClientApi(
                        apiPayload as any,
                        { silent: true }
                    );
                    successNames.push(displayName);
                } catch (err) {
                    console.error("Failed to share with client", payload.clientId, err);
                    failNames.push(displayName);
                }
            }

            // Refresh both the doc-first view and any open per-client views
            queryClient.invalidateQueries({ queryKey: ["master-documents"] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });

            // Truncate long lists so the toast doesn't become a wall of text.
            const formatNames = (names: string[]) => {
                if (names.length <= 3) return names.join(", ");
                return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
            };

            if (successNames.length > 0 && failNames.length === 0) {
                toast.success(
                    `Documents shared with ${formatNames(successNames)} successfully`
                );
                onShared?.();
                handleClose();
            } else if (successNames.length > 0 && failNames.length > 0) {
                toast.warn(
                    `Shared with ${formatNames(successNames)}. Failed for ${formatNames(failNames)}.`
                );
                onShared?.();
                handleClose();
            } else {
                toast.error(`Failed to share documents with ${formatNames(failNames)}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-2">
            {/* Selected documents preview */}
            <p className="font-semibold text-[14px] mb-2">
                Selected Documents ({selectedDocs.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-6 max-h-[120px] overflow-y-auto pr-1">
                {selectedDocs.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center gap-x-3 font-medium text-[14px] min-w-0"
                    >
                        <IoDocumentTextOutline className="text-primaryColorDark text-xl flex-shrink-0" />
                        <span className="truncate" title={doc.name}>
                            {doc.name}
                        </span>
                    </div>
                ))}
            </div>

            <hr className="text-textGreyColor/30 h-[2px] mb-4" />

            {/* Client list */}
            <p className="font-semibold text-[14px] mb-2">Choose Clients</p>
            <p className="text-[12px] text-textGreyColor mb-3">
                Documents already shared with a client are skipped automatically.
            </p>

            {hasUnapprovedClients && (
                <p className="text-[12px] text-yellow-700 bg-yellow-50 px-3 py-2 rounded mb-3">
                    Some clients are pending admin approval and cannot receive documents yet.
                </p>
            )}

            <div className="flex flex-col gap-y-2 max-h-[320px] overflow-y-auto pr-1">
                {clients.map((client) => {
                    const cid = client.id ?? "";
                    const summary = perClientSummary[cid];
                    const needShareCount = summary?.needShareIds.length ?? 0;
                    const sharedCount = summary?.sharedCount ?? 0;
                    const signedCount = summary?.signedCount ?? 0;

                    const approveStatus = client.user?.isApprove;
                    const isApproved = approveStatus === "APPROVED";
                    const isFullyAlreadyShared = isApproved && needShareCount === 0;
                    const isDisabled = !isApproved || isFullyAlreadyShared;
                    const isChecked = selectedClientIds.includes(cid);

                    return (
                        <label
                            key={cid}
                            className={`flex items-center gap-x-3 p-3 rounded-md border border-lightGreyColor transition-colors ${isDisabled
                                ? "bg-gray-50 cursor-not-allowed opacity-70"
                                : "hover:bg-primaryColorDark/5 cursor-pointer"
                                }`}
                        >
                            <Checkbox
                                checked={isChecked && !isDisabled}
                                onChange={(e) =>
                                    !isDisabled && toggleClient(cid, e.target.checked)
                                }
                            />

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-[14px] capitalize truncate">
                                    {client.user?.fullName || "Unnamed Client"}
                                </p>
                                {/* Email shown as plain text — no input — to avoid the editable-field confusion */}
                                <span className="block text-[12px] text-textGreyColor lowercase truncate">
                                    {client.user?.email}
                                </span>
                            </div>

                            <div className="flex items-center gap-x-2 flex-wrap justify-end">
                                {!isApproved ? (
                                    approveStatus === "REJECTED" ? (
                                        <span className="px-2 py-1 rounded text-[11px] font-medium bg-red-50 text-red-700">
                                            Rejected
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded text-[11px] font-medium bg-yellow-50 text-yellow-700">
                                            Pending Approval
                                        </span>
                                    )
                                ) : (
                                    <>
                                        {needShareCount > 0 && (
                                            <span className="px-2 py-1 rounded text-[11px] font-medium bg-primaryColorDark/10 text-primaryColorDark">
                                                {needShareCount} to share
                                            </span>
                                        )}
                                        {sharedCount > 0 && (
                                            <span className="px-2 py-1 rounded text-[11px] font-medium bg-yellow-50 text-yellow-700">
                                                {sharedCount} already shared
                                            </span>
                                        )}
                                        {signedCount > 0 && (
                                            <span className="px-2 py-1 rounded text-[11px] font-medium bg-green-50 text-green-700">
                                                {signedCount} signed
                                            </span>
                                        )}
                                        {isFullyAlreadyShared && (
                                            <span className="px-2 py-1 rounded text-[11px] font-medium text-textGreyColor">
                                                All up to date
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-end">
                <div className="w-[140px]">
                    <Button
                        text="Send"
                        sm
                        onclick={handleSend}
                        isLoading={isLoading}
                        disabled={isLoading || selectedClientIds.length === 0}
                    />
                </div>
            </div>
        </div>
    );
};

const MultiClientDocShareModal: React.FC<MultiClientDocShareModalProps> = (props) => {
    return (
        <ModalLayout
            heading="Share Documents with Clients"
            modalBodyContent={<ModalBody {...props} />}
        />
    );
};

export default MultiClientDocShareModal;
