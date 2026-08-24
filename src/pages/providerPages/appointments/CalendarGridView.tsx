import React from "react";
import { AlertCircle, Video } from "lucide-react";
import { AppointmentRecord } from "@/services/appointmentApiService";

interface CalendarGridViewProps {
  viewMode: "week" | "month";
  getWeekDays: () => Date[];
  getDaysInMonthGrid: () => Date[];
  currentDate: Date;
  days: any;
  isDayTimeOff: (date: Date) => boolean;
  isDayAvailable: (date: Date) => boolean;
  getAppointmentsForDate: (date: Date) => AppointmentRecord[];
  isToday: (date: Date) => boolean;
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appt: AppointmentRecord) => void;
}

// Helper to determine status-based colors, labels, and hover styles
const getEventStatusStyles = (status?: string) => {
  const normalizedStatus = (status || "").toUpperCase();

  switch (normalizedStatus) {
    case "COMPLETED":
      return {
        label: "Completed",
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs",
        chip: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:scale-[1.02]",
        headerText: "text-emerald-700",
        titleText: "text-emerald-950",
        tagBg: "bg-emerald-200/80 text-emerald-800",
      };
    case "CANCELLED":
    case "CANCELED":
      return {
        label: "Cancelled",
        badge:
          "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300 hover:shadow-xs",
        chip: "bg-rose-100 text-rose-800 hover:bg-rose-200 hover:scale-[1.02]",
        headerText: "text-rose-700",
        titleText: "text-rose-950",
        tagBg: "bg-rose-200/80 text-rose-800",
      };
    case "PENDING":
      return {
        label: "Pending",
        badge:
          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:shadow-xs",
        chip: "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:scale-[1.02]",
        headerText: "text-amber-700",
        titleText: "text-amber-950",
        tagBg: "bg-amber-200/80 text-amber-800",
      };
    case "CONFIRMED":
    case "SCHEDULED":
    default:
      return {
        label: "Upcoming",
        badge:
          "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-xs",
        chip: "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-[1.02]",
        headerText: "text-blue-700",
        titleText: "text-blue-950",
        tagBg: "bg-blue-200/80 text-blue-800",
      };
  }
};

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  viewMode,
  getWeekDays,
  getDaysInMonthGrid,
  currentDate,
  days,
  isDayTimeOff,
  isDayAvailable,
  getAppointmentsForDate,
  isToday,
  onDayClick,
  onAppointmentClick,
}) => {
  if (viewMode === "week") {
    return (
      <div className="flex flex-col h-full overflow-x-auto">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center py-3 min-w-175">
          {getWeekDays().map((day, idx) => {
            const dayOfWeek = day.getDay();
            const dayConfig = days?.[dayOfWeek];
            const hasTimeOff = isDayTimeOff(day);

            return (
              <div
                key={idx}
                onClick={() => onDayClick(day)}
                className="flex flex-col items-center border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50/50 py-1 transition-colors"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={`inline-flex items-center justify-center mt-1 text-xs font-bold rounded-full w-7 h-7 ${
                    isToday(day)
                      ? "bg-primaryColorDark text-white shadow-xs"
                      : "text-gray-800"
                  }`}
                >
                  {day.getDate()}
                </span>
                {hasTimeOff ? (
                  <span className="mt-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">
                    Time Off
                  </span>
                ) : isDayAvailable(day) ? (
                  <span className="mt-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    {dayConfig.startTime} - {dayConfig.endTime}
                  </span>
                ) : (
                  <span className="mt-1 text-[9px] text-gray-400">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Week Body Slots Grid */}
        <div className="grid grid-cols-7 flex-1 min-w-175 divide-x divide-gray-200 bg-gray-50/20">
          {getWeekDays().map((day, idx) => {
            const dayOfWeek = day.getDay();
            const dayConfig = days?.[dayOfWeek];
            const hasTimeOff = isDayTimeOff(day);
            const dayAppts = getAppointmentsForDate(day);
            const available = isDayAvailable(day);

            return (
              <div
                key={idx}
                onClick={() => onDayClick(day)}
                className={`p-2 space-y-2 min-h-120 flex flex-col cursor-pointer transition-all hover:bg-blue-50/20 group relative ${
                  hasTimeOff
                    ? "bg-amber-50/30"
                    : !available
                      ? "bg-gray-50/50"
                      : "bg-white"
                }`}
              >
                {/* Hover Indicator */}
                <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-primaryColorDark text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs pointer-events-none transition-opacity">
                  Click to Edit
                </div>

                {hasTimeOff ? (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-center text-xs space-y-1">
                    <AlertCircle size={16} className="mx-auto text-amber-600" />
                    <p className="font-bold">Time Off</p>
                    <p className="text-[10px] text-amber-700">
                      No appointments
                    </p>
                  </div>
                ) : !available ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-300 font-medium italic">
                    Off Day
                  </div>
                ) : (
                  <>
                    {/* Active Hours Pill */}
                    <div className="p-2 rounded-xl bg-primaryColorLight/20 border border-primaryColorLight/40 text-primaryColorDark text-center">
                      <span className="text-[10px] font-bold block uppercase tracking-wider">
                        Available Slot
                      </span>
                      <span className="text-xs font-extrabold">
                        {dayConfig?.startTime} - {dayConfig?.endTime}
                      </span>
                    </div>

                    {/* Booked Appointments on this day */}
                    {dayAppts.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Bookings ({dayAppts.length})
                        </span>
                        {dayAppts.map((appt) => {
                          const styles = getEventStatusStyles(appt.status);
                          return (
                            <div
                              key={appt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentClick(appt);
                              }}
                              className={`p-2 rounded-xl border cursor-pointer transition-all space-y-1 ${styles.badge}`}
                            >
                              <div
                                className={`flex items-center justify-between text-[10px] font-semibold ${styles.headerText}`}
                              >
                                <span className="flex items-center gap-1">
                                  <Video size={10} /> {appt.sessionType}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${styles.tagBg}`}
                                >
                                  {styles.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-xs font-bold truncate ${styles.titleText}`}
                                >
                                  {appt.guestName}
                                </p>
                                <span className="text-[10px] opacity-75 font-semibold">
                                  {new Date(appt.startTime).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Month View
  return (
    <div className="flex flex-col h-full min-w-175">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-gray-200">
        {getDaysInMonthGrid().map((day, idx) => {
          const dayOfWeek = day.getDay();
          const dayConfig = days?.[dayOfWeek];
          const hasTimeOff = isDayTimeOff(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayAppts = getAppointmentsForDate(day);
          const available = isDayAvailable(day);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={`p-2 flex flex-col min-h-22.5 cursor-pointer transition-colors hover:bg-blue-50/40 ${
                !isCurrentMonth
                  ? "bg-gray-50/40 text-gray-300"
                  : "bg-white text-gray-800"
              } ${hasTimeOff ? "bg-amber-50/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center text-xs font-bold rounded-full w-6 h-6 ${
                    isToday(day)
                      ? "bg-primaryColorDark text-white"
                      : "text-gray-700"
                  }`}
                >
                  {day.getDate()}
                </span>
                {hasTimeOff && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1 rounded-sm">
                    Off
                  </span>
                )}
              </div>

              {!hasTimeOff && available && (
                <div className="mt-auto pt-1">
                  <span className="block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 truncate">
                    {dayConfig?.startTime} - {dayConfig?.endTime}
                  </span>
                </div>
              )}

              {dayAppts.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayAppts.map((appt) => {
                    const styles = getEventStatusStyles(appt.status);
                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appt);
                        }}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate cursor-pointer transition-all flex items-center justify-between gap-1 ${styles.chip}`}
                      >
                        <span className="truncate">{appt.guestName}</span>
                        <span className="text-[8px] font-extrabold uppercase opacity-80 shrink-0">
                          {styles.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
