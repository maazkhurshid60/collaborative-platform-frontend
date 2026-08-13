import { useEffect, useState } from "react";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import QueryDetailsModal from "./QueryDetailsModal";
import { formatRelativeTime } from "@/utils/dataTimeUtils";
import { getInitials } from "@/utils/name-utils";
import { providerQueryApiService } from "@/services/providerQueryApiService";
import DeleteClientModal from "@/components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { isModalDeleteReducer } from "@/redux/slices/ModalSlice";
import { AppDispatch, RootState } from "@/redux/store";

export interface ProviderQueryRecord {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  message: string;
  createdAt: string;
}

const QueryItem = ({ query }: { query: ProviderQueryRecord }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const isModalDelete = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );

  // The delete-confirmation flag is app-wide, so drop our own gate as soon as it
  // closes (confirm or cancel) — otherwise a stale gate could re-open this item's
  // modal when a different query's delete button is clicked next.
  useEffect(() => {
    if (!isModalDelete) setIsConfirmOpen(false);
  }, [isModalDelete]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await providerQueryApiService.deleteMyQuery(query.id);
    },
    onSuccess: () => {
      toast.success("Query deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["providerQueries"] });
      dispatch(isModalDeleteReducer(false));
    },
    onError: () => {
      toast.error("Failed to delete query.");
      dispatch(isModalDeleteReducer(false));
    },
  });

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
    dispatch(isModalDeleteReducer(true));
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-lightGreyColor/25 bg-white p-5 shadow-sm transition-all duration-300 hover:border-primaryColorLight hover:shadow-md sm:p-6">
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primaryColorDark font-[Poppins] text-[14px] font-bold text-white ring-2 ring-primaryColorLight/70 ring-offset-2 ring-offset-white">
            {getInitials(query.guestName)}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Name + Time + Actions */}
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate font-[Montserrat] text-[16px] font-semibold text-textColor">
                {query.guestName}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <p
                  className="text-[12px] text-lightGreyColor"
                  title={new Date(query.createdAt).toLocaleString()}
                >
                  {formatRelativeTime(query.createdAt)}
                </p>

                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  title="View details"
                  aria-label="View details"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-primaryColorDark transition-colors duration-200 hover:bg-primaryColorLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColorDark/40"
                >
                  <Eye size={17} />
                </button>

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={deleteMutation.isPending}
                  title="Delete query"
                  aria-label="Delete query"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={`mailto:${query.guestEmail}`}
                className="flex items-center gap-1.5 break-all text-[13px] text-textGreyColor transition-colors hover:text-primaryColorDark"
              >
                <Mail size={13} className="shrink-0" />
                {query.guestEmail}
              </a>

              {query.guestPhone && (
                <a
                  href={`tel:${query.guestPhone}`}
                  className="flex items-center gap-1.5 text-[13px] text-textGreyColor transition-colors hover:text-primaryColorDark"
                >
                  <Phone size={13} className="shrink-0" />
                  {query.guestPhone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <QueryDetailsModal
          query={query}
          onClose={() => setShowDetails(false)}
        />
      )}

      {isModalDelete && isConfirmOpen && (
        <DeleteClientModal
          heading="Delete Query"
          confirmText="Delete"
          text={
            <span>
              This will permanently delete this query from{" "}
              <span className="font-semibold">{query.guestName}</span>. Are
              you sure you want to delete it?
            </span>
          }
          isLoading={deleteMutation.isPending}
          onDeleteConfirm={() => deleteMutation.mutate()}
        />
      )}
    </>
  );
};

export default QueryItem;
