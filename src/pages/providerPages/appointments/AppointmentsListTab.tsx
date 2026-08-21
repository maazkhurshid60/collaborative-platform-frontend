import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Mail, Phone, Video, Building2, Home, X, Check } from "lucide-react";

import Loader from "@/components/loader/Loader";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";
import DeleteClientModal from "@/components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { isModalDeleteReducer } from "@/redux/slices/ModalSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { appointmentApiService, type AppointmentRecord } from "@/services/appointmentApiService";
import { startCallFromUrl } from "@/utils/callModalService";

const STATUS_FILTERS = [
    { label: "All", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Upcoming", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Declined", value: "DECLINED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const SESSION_TYPE_ICON = { ONLINE: Video, IN_PERSON: Building2, HOME_VISIT: Home };
const SESSION_TYPE_LABEL = { ONLINE: "Online", IN_PERSON: "In-person", HOME_VISIT: "Home visit" };

const STATUS_BADGE: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
    COMPLETED: "bg-primaryColorLight/50 text-primaryColorDark border-primaryColorLight",
    DECLINED: "bg-red-50 text-red-500 border-red-100",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

type ConfirmAction = { type: "cancel" | "decline"; appointmentId: string };

const AppointmentsListTab = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>();
    const [statusFilter, setStatusFilter] = useState("");
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const isModalDelete = useSelector((state: RootState) => state.modalSlice.isModalDelete);

    useEffect(() => {
        if (!isModalDelete) setConfirmAction(null);
    }, [isModalDelete]);

    const { data, isLoading } = useQuery<AppointmentRecord[]>({
        queryKey: ["appointments", statusFilter],
        queryFn: async () => {
            const response = await appointmentApiService.getMyAppointments(statusFilter || undefined);
            return response?.data ?? [];
        },
    });

    const invalidateAndClose = (message: string) => {
        toast.success(message);
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        dispatch(isModalDeleteReducer(false));
    };

    const cancelMutation = useMutation({
        mutationFn: async (appointmentId: string) => appointmentApiService.cancelMyAppointment(appointmentId),
        onSuccess: () => invalidateAndClose("Appointment cancelled successfully."),
        onError: () => {
            toast.error("Failed to cancel appointment.");
            dispatch(isModalDeleteReducer(false));
        },
    });

    const declineMutation = useMutation({
        mutationFn: async (appointmentId: string) => appointmentApiService.declineMyAppointment(appointmentId),
        onSuccess: () => invalidateAndClose("Booking request declined."),
        onError: () => {
            toast.error("Failed to decline booking request.");
            dispatch(isModalDeleteReducer(false));
        },
    });

    const acceptMutation = useMutation({
        mutationFn: async (appointmentId: string) => appointmentApiService.acceptMyAppointment(appointmentId),
        onSuccess: () => {
            toast.success("Booking request accepted.");
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
        },
        onError: () => toast.error("Failed to accept booking request."),
    });

    const joinCallMutation = useMutation({
        mutationFn: async (appointmentId: string) => appointmentApiService.getCallJoinInfo(appointmentId),
        onSuccess: (response) => {
            const joinUrl = response?.data?.joinUrl;
            if (!joinUrl) {
                toast.error("Couldn't get the video call link.");
                return;
            }
            startCallFromUrl(joinUrl);
        },
        onError: (error: unknown) => {
            const err = error as AxiosError<{ message?: string }>;
            toast.error(err?.response?.data?.message || "Couldn't join the video call.");
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
                    {appointments.map((appt) => {
                        const SessionIcon = SESSION_TYPE_ICON[appt.sessionType];
                        return (
                            <div
                                key={appt.id}
                                className="flex flex-col gap-3 rounded-2xl border border-lightGreyColor/25 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[15px] font-semibold text-textColor">
                                            {appt.isMyBooking
                                                ? `Booked with ${appt.provider?.user?.fullName || appt.guestName}`
                                                : appt.guestName}
                                        </p>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[appt.displayStatus]}`}
                                        >
                                            {appt.displayStatus}
                                        </span>
                                        {appt.isMyBooking && (
                                            <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-600">
                                                My Booking
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-[13px] text-textGreyColor">
                                        {new Date(appt.startTime).toLocaleString(undefined, {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-textGreyColor">
                                        <span className="flex items-center gap-1.5">
                                            <SessionIcon size={13} /> {SESSION_TYPE_LABEL[appt.sessionType]}
                                        </span>
                                        <a
                                            href={`mailto:${appt.guestEmail}`}
                                            className="flex items-center gap-1.5 hover:text-primaryColorDark"
                                        >
                                            <Mail size={13} /> {appt.guestEmail}
                                        </a>
                                        {appt.guestPhone && (
                                            <a
                                                href={`tel:${appt.guestPhone}`}
                                                className="flex items-center gap-1.5 hover:text-primaryColorDark"
                                            >
                                                <Phone size={13} /> {appt.guestPhone}
                                            </a>
                                        )}
                                    </div>
                                    {appt.notes && (
                                        <p className="mt-2 text-[13px] text-textColor">{appt.notes}</p>
                                    )}
                                </div>

                                {appt.displayStatus === "PENDING" && !appt.isMyBooking && (
                                    <div className="flex shrink-0 items-center gap-2 self-start">
                                        <button
                                            type="button"
                                            onClick={() => acceptMutation.mutate(appt.id)}
                                            disabled={acceptMutation.isPending}
                                            className="flex items-center gap-1.5 rounded-full border border-primaryColorDark/30 bg-primaryColorLight/40 px-4 py-2 text-[13px] font-semibold text-primaryColorDark transition-colors hover:bg-primaryColorLight disabled:opacity-50 cursor-pointer"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openConfirm("decline", appt.id)}
                                            className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
                                        >
                                            <X size={14} /> Decline
                                        </button>
                                    </div>
                                )}

                                {appt.displayStatus === "CONFIRMED" && (
                                    <div className="flex shrink-0 items-center gap-2 self-start">
                                        {appt.sessionType === "ONLINE" && (
                                            <button
                                                type="button"
                                                onClick={() => joinCallMutation.mutate(appt.id)}
                                                disabled={joinCallMutation.isPending}
                                                className="flex items-center gap-1.5 rounded-full border border-primaryColorDark/30 bg-primaryColorLight/40 px-4 py-2 text-[13px] font-semibold text-primaryColorDark transition-colors hover:bg-primaryColorLight disabled:opacity-50 cursor-pointer"
                                            >
                                                <Video size={14} /> Join Video Call
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openConfirm("cancel", appt.id)}
                                            className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
                                        >
                                            <X size={14} /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalDelete && confirmAction?.type === "cancel" && (
                <DeleteClientModal
                    heading="Cancel Appointment"
                    confirmText="Cancel Appointment"
                    text={<span>This will cancel the appointment and free up the slot. Are you sure?</span>}
                    isLoading={cancelMutation.isPending}
                    onDeleteConfirm={() => cancelMutation.mutate(confirmAction.appointmentId)}
                />
            )}

            {isModalDelete && confirmAction?.type === "decline" && (
                <DeleteClientModal
                    heading="Decline Booking Request"
                    confirmText="Decline Request"
                    text={
                        <span>
                            This will decline the request and free up the slot. The guest will be notified by
                            email. Are you sure?
                        </span>
                    }
                    isLoading={declineMutation.isPending}
                    onDeleteConfirm={() => declineMutation.mutate(confirmAction.appointmentId)}
                />
            )}
        </div>
    );
};

export default AppointmentsListTab;
