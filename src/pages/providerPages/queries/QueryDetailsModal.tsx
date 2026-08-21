import { useEffect } from "react";
import { Mail, MessageSquare, Phone, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import type { ProviderQueryRecord } from "./QueryItem";
import { providerQueryApiService } from "@/services/providerQueryApiService";

interface QueryDetailsModalProps {
  query: ProviderQueryRecord;
  onClose: () => void;
}

const QueryDetailsModal = ({ query, onClose }: QueryDetailsModalProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await providerQueryApiService.deleteMyQuery(query.id);
    },
    onSuccess: () => {
      toast.success("Query deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["providerQueries"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to delete query.");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      deleteMutation.mutate();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-textGreyColor hover:text-textColor cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <p className="text-[12px] font-medium tracking-wide text-primaryColorDark uppercase">
          Query Details
        </p>
        <p className="mt-1 text-[20px] font-bold text-textColor">
          {query.guestName}
        </p>

        <div className="mt-4 flex flex-col gap-2.5 text-[14px] text-textGreyColor">
          <a
            href={`mailto:${query.guestEmail}`}
            className="flex items-center gap-2 hover:text-primaryColorDark"
          >
            <Mail size={15} /> {query.guestEmail}
          </a>
          {query.guestPhone && (
            <a
              href={`tel:${query.guestPhone}`}
              className="flex items-center gap-2 hover:text-primaryColorDark"
            >
              <Phone size={15} /> {query.guestPhone}
            </a>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium tracking-wide text-textGreyColor uppercase">
            <MessageSquare size={13} /> Message
          </p>
          <div className="rounded-lg bg-inputBgColor p-4">
            <p className="text-[14px] whitespace-pre-line text-textColor">
              {query.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-[12px] text-textGreyColor">
            Submitted {new Date(query.createdAt).toLocaleString()}
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 text-[13px] font-medium text-red-500 hover:text-red-600 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />{" "}
            {deleteMutation.isPending ? "Deleting..." : "Delete Query"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryDetailsModal;
