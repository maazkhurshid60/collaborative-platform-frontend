import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  Building2,
  CalendarClock,
  Check,
  Copy,
  Home,
  Loader2,
  Mail,
  Phone,
  Send,
  Video,
  X,
} from "lucide-react";

import {
  appointmentApiService,
  type AppointmentRecord,
} from "@/services/appointmentApiService";
import { getFormatedDateAndTime } from "@/utils/dataTimeUtils";
import { RescheduleModal } from "./RescheduleModal";
import { useSubscription } from "@/hooks/useSubscription";

const SESSION_TYPE_ICON = {
  ONLINE: Video,
  IN_PERSON: Building2,
  HOME_VISIT: Home,
};

const SESSION_TYPE_LABEL = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HOME_VISIT: "Home visit",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED:
    "bg-primaryColorLight/50 text-primaryColorDark border-primaryColorLight",
  DECLINED: "bg-red-50 text-red-500 border-red-100",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

interface AppointmentItemProps {
  appt: AppointmentRecord;
  onOpenConfirm: (type: "cancel" | "decline", appointmentId: string) => void;
}

const AppointmentItem = ({ appt, onOpenConfirm }: AppointmentItemProps) => {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const { canUsePremiumFeature } = useSubscription();

  const SessionIcon = SESSION_TYPE_ICON[appt.sessionType];
  const isCopied = copiedId === appt.id;

  const acceptMutation = useMutation({
    mutationFn: async () => appointmentApiService.acceptMyAppointment(appt.id),
    onSuccess: () => {
      toast.success("Booking request accepted.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: () => toast.error("Failed to accept booking request."),
  });

  const resendEmailMutation = useMutation({
    mutationFn: async () =>
      appointmentApiService.resendAppointmentEmail(appt.id),
    onSuccess: () =>
      toast.success("Meeting invitation email resent to guest successfully!"),
    onError: () => toast.error("Failed to resend meeting invitation email."),
  });

  const joinCallMutation = useMutation({
    mutationFn: async () => appointmentApiService.getCallJoinInfo(appt.id),
    onSuccess: (response) => {
      const joinUrl = response?.data?.joinUrl;
      if (!joinUrl) {
        toast.error("Couldn't get the video call link.");
        return;
      }
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || "Upgrade to continue using calling.");
        return;
      }
      toast.error(
        err?.response?.data?.message || "Couldn't join the video call.",
      );
    },
  });

  const copyLinkMutation = useMutation({
    mutationFn: async () =>
      appointmentApiService.getAppointmentShareLink(appt.id),
    onSuccess: async (response) => {
      const shareUrl = response?.data?.shareUrl;
      if (!shareUrl) {
        toast.error("Couldn't get the video call link.");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(appt.id);
      toast.success("Meeting link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2500);
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to copy meeting link.",
      );
    },
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-lightGreyColor/25 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
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
          {getFormatedDateAndTime(appt.startTime)}
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
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primaryColorDark/30 bg-primaryColorLight/40 px-4 py-2 text-[13px] font-semibold text-primaryColorDark transition-colors hover:bg-primaryColorLight disabled:opacity-50"
          >
            <Check size={14} /> Accept
          </button>
          <button
            type="button"
            onClick={() => onOpenConfirm("decline", appt.id)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <X size={14} /> Decline
          </button>
        </div>
      )}

      {appt.displayStatus === "CONFIRMED" && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
          {appt.sessionType === "ONLINE" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!canUsePremiumFeature) {
                    toast.error("Your 3-day trial for calling has ended. Upgrade to keep making calls.");
                    return;
                  }
                  joinCallMutation.mutate();
                }}
                disabled={joinCallMutation.isPending}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primaryColorDark/30 bg-primaryColorLight/40 px-4 py-2 text-[13px] font-semibold text-primaryColorDark transition-colors hover:bg-primaryColorLight disabled:opacity-50"
              >
                <Video size={14} /> Join Video Call
              </button>

              <button
                type="button"
                onClick={() => copyLinkMutation.mutate()}
                disabled={copyLinkMutation.isPending}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] font-medium text-textColor transition-colors hover:bg-gray-100 disabled:opacity-50"
                title="Copy Meeting Link"
              >
                {copyLinkMutation.isPending ? (
                  <Loader2
                    size={14}
                    className="animate-spin text-primaryColorDark"
                  />
                ) : isCopied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-textGreyColor" />
                )}
                <span>
                  {copyLinkMutation.isPending
                    ? "Copying..."
                    : isCopied
                      ? "Copied!"
                      : "Copy Link"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => resendEmailMutation.mutate()}
                disabled={resendEmailMutation.isPending}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-[13px] font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                title="Resend Meeting Link Email"
              >
                {resendEmailMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Resend Email</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsRescheduleOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
            title="Reschedule Appointment"
          >
            <CalendarClock size={14} />
            <span>Reschedule</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenConfirm("cancel", appt.id)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={appt}
      />
    </div>
  );
};

export default AppointmentItem;
