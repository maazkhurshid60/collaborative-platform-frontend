import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { IoDocumentTextOutline } from "react-icons/io5";

import ModalLayout from "../../modalLayout/ModalLayout";
import Button from "../../../button/Button";
import Checkbox from "../../../checkbox/Checkbox";
import documentApiService from "../../../../apiServices/documentApi/DocumentApi";
import axiosInstance from "../../../../apiServices/axiosInstance/AxiosInstance";
import { isMultiClientDocShareModalReducer } from "../../../../redux/slices/ModalSlice";
import { AppDispatch } from "../../../../redux/store";
import { DocClientStatus } from "../../../../types/documentType/DocumentType";
import { ClientType } from "../../../../types/clientType/ClientType";
import { toast } from "react-toastify";
import ProviderFormFillStep from "./ProviderFormFillStep";

interface MultiClientDocShareModalProps {
  selectedDocs: any[];
  clients: ClientType[];
  providerId?: string;
  senderId?: string;
  onShared?: () => void;
}

const statusFor = (
  doc: any,
  clientId: string | undefined,
  providerId: string | undefined,
): DocClientStatus => {
  if (!clientId || !providerId) return "NEED_SHARE";

  if (doc.isForm) {
    const row = doc.shares?.find(
      (s: any) => s.clientId === clientId && s.providerId === providerId,
    );
    if (!row) return "NEED_SHARE";
    if (row.status === "SUBMITTED") return "NEED_SHARE";
    return "NEED_SHARE";
  }

  const row = doc.sharedWith?.find(
    (sw: any) => sw.clientId === clientId && sw.providerId === providerId,
  );
  if (!row) return "NEED_SHARE";
  if (row.eSignature) return "NEED_SHARE";
  return "NEED_SHARE";
};

interface ModalBodyProps extends MultiClientDocShareModalProps {
  step: "SELECT_CLIENTS" | "FILL_FORMS";
  setStep: React.Dispatch<React.SetStateAction<"SELECT_CLIENTS" | "FILL_FORMS">>;
}

const ModalBody: React.FC<ModalBodyProps> = ({
  selectedDocs,
  clients,
  providerId,
  senderId,
  onShared,
  step,
  setStep,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasUnapprovedClients = clients.some(
    (c) => c.user?.isApprove !== "APPROVED",
  );

  const perClientSummary = useMemo(() => {
    const map: Record<
      string,
      { needShareIds: string[]; timesShared: number }
    > = {};
    for (const client of clients) {
      const cid = client.id;
      if (!cid) continue;
      const summary = {
        needShareIds: [] as string[],
        timesShared: 0,
      };
      for (const doc of selectedDocs) {
        summary.needShareIds.push(doc.id); // Always selectable

        if (doc.isForm) {
          const formShares = doc.shares?.filter(
            (s: any) => s.clientId === cid && s.providerId === providerId,
          );
          summary.timesShared += formShares?.length || 0;
        } else {
          const docShares = doc.sharedWith?.filter(
            (sw: any) => sw.clientId === cid && sw.providerId === providerId,
          );
          summary.timesShared += docShares?.length || 0;
        }
      }
      map[cid] = summary;
    }
    return map;
  }, [clients, selectedDocs, providerId]);

  const toggleClient = (clientId: string, checked: boolean) => {
    setSelectedClientIds((prev) =>
      checked ? [...prev, clientId] : prev.filter((id) => id !== clientId),
    );
  };

  const handleClose = () => {
    dispatch(isMultiClientDocShareModalReducer(false));
  };

  const handleSend = async () => {
    if (!providerId || !senderId) {
      toast.error(
        "Missing provider information. Please refresh and try again.",
      );
      return;
    }
    if (selectedClientIds.length === 0) {
      toast.warn("Select at least one client");
      return;
    }

    const hasProviderSections = selectedDocs.some(
      (doc) =>
        doc.isForm &&
        doc.schema?.fields?.some((f: any) => f.type === "provider-section"),
    );

    if (step === "SELECT_CLIENTS" && hasProviderSections) {
      setStep("FILL_FORMS");
      return;
    }

    await executeSend({});
  };

  const executeSend = async (providerData: Record<string, any>) => {
    // Build per-client share payloads, skipping clients who already have everything.
    const payloads = selectedClientIds
      .map((clientId) => {
        const client = clients.find((c) => c.id === clientId);
        const summary = perClientSummary[clientId];
        if (!client || !summary || summary.needShareIds.length === 0)
          return null;
        return {
          clientId,
          recipientId: client.userId ?? "",
          clientEmail: client.user?.email,
          documentId: summary.needShareIds,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (payloads.length === 0) {
      toast.info(
        "All selected documents are already shared with these clients",
      );
      return;
    }

    setIsLoading(true);
    const successNames: string[] = [];
    const failNames: string[] = [];

    try {
      for (const payload of payloads) {
        const client = clients.find((c) => c.id === payload.clientId);
        const displayName =
          client?.user?.fullName?.trim() ||
          client?.user?.email ||
          "Unnamed client";

        const formIds = payload.documentId.filter(
          (id) => selectedDocs.find((d) => d.id === id)?.isForm,
        );
        const docIds = payload.documentId.filter(
          (id) => !selectedDocs.find((d) => d.id === id)?.isForm,
        );

        const apiPayload = {
          providerId,
          clientId: payload.clientId,
          documentId: docIds,
          recipientId: payload.recipientId,
          senderId,
          clientEmail: payload.clientEmail,
          title: "Document has shared",
        };

        try {
          let shareSuccess = false;
          if (docIds.length > 0) {
            await documentApiService.documentSharedWithClientApi(
              apiPayload as any,
              { silent: true },
            );
            shareSuccess = true;
          }

          if (formIds.length > 0) {
            for (const formId of formIds) {
              await axiosInstance.post("/form/share", {
                templateId: formId,
                clientId: payload.clientId,
                providerId,
                expirationDays: 7,
                providerData:
                  Object.keys(providerData).length > 0
                    ? providerData
                    : undefined,
              });
            }
            shareSuccess = true;
          }

          if (shareSuccess) {
            successNames.push(displayName);
          }
        } catch (err) {
          console.error("Failed to share with client", payload.clientId, err);
          failNames.push(displayName);
        }
      }

      // Refresh both the doc-first view and any open per-client views
      queryClient.invalidateQueries({ queryKey: ["master-documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["form-templates"] });

      // Truncate long lists so the toast doesn't become a wall of text.
      const formatNames = (names: string[]) => {
        if (names.length <= 3) return names.join(", ");
        return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
      };

      if (successNames.length > 0 && failNames.length === 0) {
        toast.success(
          `Documents shared with ${formatNames(successNames)} successfully`,
        );
        onShared?.();
        handleClose();
      } else if (successNames.length > 0 && failNames.length > 0) {
        toast.warn(
          `Shared with ${formatNames(successNames)}. Failed for ${formatNames(failNames)}.`,
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
      {step === "FILL_FORMS" ? (
        <ProviderFormFillStep
          forms={selectedDocs.filter((d) => d.isForm)}
          onBack={() => setStep("SELECT_CLIENTS")}
          onSubmit={executeSend}
          isSubmitting={isLoading}
        />
      ) : (
        <>
          {/* Selected documents preview */}
          <p className="font-semibold text-[14px] mb-2">
            Selected Documents ({selectedDocs.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-6 max-h-30 overflow-y-auto pr-1">
            {selectedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-x-3 font-medium text-[14px] min-w-0"
              >
                <IoDocumentTextOutline className="text-primaryColorDark text-xl shrink-0" />
                <span className="truncate" title={doc.name}>
                  {doc.name}
                </span>
              </div>
            ))}
          </div>

          <hr className="text-textGreyColor/30 h-0.5 mb-4" />

          {/* Client list */}
          <p className="font-semibold text-[14px] mb-2">Choose Clients</p>
          <p className="text-[12px] text-textGreyColor mb-3">
            Documents can be shared with a client multiple times.
          </p>

          {hasUnapprovedClients && (
            <p className="text-[12px] text-yellow-700 bg-yellow-50 px-3 py-2 rounded mb-3">
              Some clients are pending admin approval and cannot receive
              documents yet.
            </p>
          )}

          <div className="flex flex-col gap-y-2 max-h-80 overflow-y-auto pr-1">
            {clients.map((client) => {
              const cid = client.id ?? "";
              const summary = perClientSummary[cid];
              const timesShared = summary?.timesShared ?? 0;

              const approveStatus = client.user?.isApprove;
              const isApproved = approveStatus === "APPROVED";
              const isDisabled = !isApproved;
              const isChecked = selectedClientIds.includes(cid);

              return (
                <label
                  key={cid}
                  className={`flex items-center gap-x-3 p-3 rounded-md border border-lightGreyColor transition-colors ${
                    isDisabled
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
                        {timesShared > 0 && (
                          <span className="px-2 py-1 rounded text-[11px] font-medium bg-primaryColorDark/10 text-primaryColorDark">
                            Shared {timesShared} {timesShared === 1 ? 'time' : 'times'}
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
            <div className="w-35">
              <Button
                text={
                  isLoading
                    ? "Loading..."
                    : selectedDocs.some(
                          (doc) =>
                            doc.isForm &&
                            doc.schema?.fields?.some(
                              (f: any) => f.type === "provider-section",
                            ),
                        )
                      ? "Next"
                      : "Send"
                }
                sm
                onclick={handleSend}
                isLoading={isLoading}
                disabled={
                  isLoading ||
                  hasUnapprovedClients ||
                  selectedClientIds.length === 0
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MultiClientDocShareModal: React.FC<MultiClientDocShareModalProps> = (
  props,
) => {
  const [step, setStep] = useState<"SELECT_CLIENTS" | "FILL_FORMS">(
    "SELECT_CLIENTS",
  );

  return (
    <ModalLayout
      heading="Share Documents with Clients"
      modalBodyContent={<ModalBody {...props} step={step} setStep={setStep} />}
      widthClass={step === "FILL_FORMS" ? "w-[95%] max-w-4xl" : "w-[90%] md:w-[60%] lg:w-[45%]"}
    />
  );
};

export default MultiClientDocShareModal;
