import React from "react";
import { X } from "lucide-react";
import { AppointmentRecord } from "@/services/appointmentApiService";

interface AppointmentDetailModalProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Appointment Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center justify-between">
            <span><strong>Status:</strong></span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
              {appointment.status || "Upcoming"}
            </span>
          </div>
          <p>
            <strong>Guest:</strong> {appointment.guestName}
          </p>
          <p>
            <strong>Email:</strong> {appointment.guestEmail}
          </p>
          <p>
            <strong>Type:</strong> {appointment.sessionType}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {new Date(appointment.startTime).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
