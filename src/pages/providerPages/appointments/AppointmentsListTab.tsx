import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "@/components/loader/Loader";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";
import DeleteClientModal from "@/components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { isModalDeleteReducer } from "@/redux/slices/ModalSlice";
import { AppDispatch, RootState } from "@/redux/store";
import {
  appointmentApiService,
  type AppointmentRecord,
} from "@/services/appointmentApiService";
import AppointmentItem from "./AppointmentItem";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Upcoming", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Cancelled", value: "CANCELLED" },
];

type ConfirmAction = { type: "cancel" | "decline"; appointmentId: string };

const AppointmentsListTab = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const isModalDelete = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );

  useEffect(() => {
    if (!isModalDelete) setConfirmAction(null);
  }, [isModalDelete]);

  const { data, isLoading } = useQuery<AppointmentRecord[]>({
    queryKey: ["appointments", statusFilter],
    queryFn: async () => {
      const response = await appointmentApiService.getMyAppointments(
        statusFilter || undefined,
      );
      return response?.data ?? [];
    },
  });

  const invalidateAndClose = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    dispatch(isModalDeleteReducer(false));
  };

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) =>
      appointmentApiService.cancelMyAppointment(appointmentId),
    onSuccess: () => invalidateAndClose("Appointment cancelled successfully."),
    onError: () => {
      toast.error("Failed to cancel appointment.");
      dispatch(isModalDeleteReducer(false));
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (appointmentId: string) =>
      appointmentApiService.declineMyAppointment(appointmentId),
    onSuccess: () => invalidateAndClose("Booking request declined."),
    onError: () => {
      toast.error("Failed to decline booking request.");
      dispatch(isModalDeleteReducer(false));
    },
  });

  const openConfirm = (type: ConfirmAction["type"], appointmentId: string) => {
    setConfirmAction({ type, appointmentId });
    dispatch(isModalDeleteReducer(true));
  };

  const appointments = data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              statusFilter === f.value
                ? "bg-primaryColorDark text-white"
                : "bg-inputBgColor text-textGreyColor hover:text-textColor"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : appointments.length === 0 ? (
        <NoRecordFound />
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((appt) => (
            <AppointmentItem
              key={appt.id}
              appt={appt}
              onOpenConfirm={openConfirm}
            />
          ))}
        </div>
      )}

      {isModalDelete && confirmAction?.type === "cancel" && (
        <DeleteClientModal
          heading="Cancel Appointment"
          confirmText="Cancel Appointment"
          text={
            <span>
              This will cancel the appointment and free up the slot. Are you
              sure?
            </span>
          }
          isLoading={cancelMutation.isPending}
          onDeleteConfirm={() =>
            cancelMutation.mutate(confirmAction.appointmentId)
          }
        />
      )}

      {isModalDelete && confirmAction?.type === "decline" && (
        <DeleteClientModal
          heading="Decline Booking Request"
          confirmText="Decline Request"
          text={
            <span>
              This will decline the request and free up the slot. The guest will
              be notified by email. Are you sure?
            </span>
          }
          isLoading={declineMutation.isPending}
          onDeleteConfirm={() =>
            declineMutation.mutate(confirmAction.appointmentId)
          }
        />
      )}
    </div>
  );
};

export default AppointmentsListTab;
