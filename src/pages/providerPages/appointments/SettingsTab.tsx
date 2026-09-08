import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Globe,
  Clock,
  Repeat,
  Check,
  Info,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Loader from "@/components/loader/Loader";
import Toggle from "@/components/toggle/Toggle";
import { availabilityApiService } from "@/services/availabilityApiService";
import { US_TIMEZONES } from "./timezones";
import { SESSION_LENGTH_OPTIONS } from "./types";

interface SettingsFormState {
  timezone: string;
  appointmentDurationMinutes: number;
  bufferMinutes: number;
  isRecurringWeekly: boolean;
}

const SettingsTab = () => {
  const queryClient = useQueryClient();

  const { data: bookingSettings, isLoading } = useQuery({
    queryKey: ["availability", "settings"],
    queryFn: async () => {
      const response = await availabilityApiService.getBookingSettings();
      return response?.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SettingsFormState>({
      defaultValues: {
        timezone: "",
        appointmentDurationMinutes: 50,
        bufferMinutes: 0,
        isRecurringWeekly: true,
      },
    });

  const isRecurringWeekly = watch("isRecurringWeekly");

  useEffect(() => {
    if (!bookingSettings) return;
    reset({
      timezone: bookingSettings.timezone ?? "",
      appointmentDurationMinutes:
        bookingSettings.appointmentDurationMinutes ?? 50,
      bufferMinutes: bookingSettings.bufferMinutes ?? 0,
      isRecurringWeekly: (bookingSettings as any).isRecurringWeekly ?? true,
    });
  }, [bookingSettings, reset]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (values: SettingsFormState) => {
      await availabilityApiService.setBookingSettings({
        timezone: values.timezone,
        appointmentDurationMinutes: Number(values.appointmentDurationMinutes),
        bufferMinutes: Number(values.bufferMinutes),
        ...({ isRecurringWeekly: values.isRecurringWeekly } as any),
      });
    },
    onSuccess: () => {
      toast.success("Appointment settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to save settings.";
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => saveSettingsMutation.mutate(values))}
      className="w-full space-y-6 pb-8"
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Response Message Alert Banner */}
      {saveSettingsMutation.isSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Appointment settings updated successfully!</span>
        </div>
      )}

      {saveSettingsMutation.isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>
            {(saveSettingsMutation.error as any)?.response?.data?.message ||
              "Failed to save settings. Please try again."}
          </span>
        </div>
      )}
      {/* Top Banner */}
      {/* <div className="bg-linear-to-r from-primaryColorDark via-[#2da89f] to-primaryColorDark p-6 md:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/30">
              <Sparkles size={13} /> Preferences & Rules
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-[Montserrat] tracking-tight">
              Appointment Settings
            </h2>
            <p className="text-xs md:text-sm text-white/90 max-w-2xl">
              Customize your booking duration, buffer intervals, time zone
              localization, and schedule recurrence rules.
            </p>
          </div>
        </div>
      </div> */}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Zone Settings Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
                <Globe size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Regional Timezone
                </h3>
                <p className="text-xs text-gray-500">
                  Align slot times with your primary location
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Time Zone Selection
              </label>
              <div className="relative">
                <select
                  {...register("timezone")}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark focus:ring-4 focus:ring-primaryColorDark/10 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Select your timezone
                  </option>
                  {US_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-center gap-2">
            <Info size={15} className="text-gray-400 shrink-0" />
            <span>
              Bookings automatically adjust to the client's local timezone.
            </span>
          </div>
        </div>

        {/* Duration & Buffer Settings Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold border border-purple-100">
              <Sliders size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Session & Buffer Rules
              </h3>
              <p className="text-xs text-gray-500">
                Define session duration and rest intervals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Session Length
              </label>
              <select
                {...register("appointmentDurationMinutes")}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark focus:ring-4 focus:ring-primaryColorDark/10 outline-none transition-all cursor-pointer"
              >
                {SESSION_LENGTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Buffer Time
              </label>
              <select
                {...register("bufferMinutes")}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark focus:ring-4 focus:ring-primaryColorDark/10 outline-none transition-all cursor-pointer"
              >
                {[0, 5, 10, 15, 30].map((m) => (
                  <option key={m} value={m}>
                    {m === 0 ? "No buffer" : `${m} minutes`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
            <Clock size={15} className="text-purple-600 shrink-0" />
            <span>
              Buffer time automatically reserves rest time between meetings.
            </span>
          </div>
        </div>
      </div>

      {/* Recurrence / Looping Mechanism Card */}
      <div className="bg-white p-6 md:p-7 rounded-3xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
              <Repeat size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Weekly Recurrence (Looping Mechanism)
              </h3>
              <p className="text-xs text-gray-500">
                Control whether daily availability repeats across subsequent
                weeks
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
              isRecurringWeekly
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isRecurringWeekly ? "Looping Enabled" : "One-Time / Non-Recurring"}
          </span>
        </div>

        {/* Control Box */}
        <div className="p-5 rounded-2xl border border-gray-200/80 bg-linear-to-r from-gray-50 to-emerald-50/20 flex items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h4 className="text-sm font-bold text-gray-900">
              Enable Recurring Schedule
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              When <strong>enabled</strong>, setting hours for any day (e.g.,
              Tuesday 9:00 AM – 5:00 PM) will automatically loop and make you
              available on <strong>every future Tuesday</strong> across upcoming
              weeks.
            </p>
          </div>

          <div className="pt-1">
            <Toggle
              checked={isRecurringWeekly}
              onChange={(e) => {
                const nextVal = e.target.checked;
                setValue("isRecurringWeekly", nextVal);
                handleSubmit((values) =>
                  saveSettingsMutation.mutate({
                    ...values,
                    isRecurringWeekly: nextVal,
                  }),
                )();
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
          <Info size={17} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              How non-recurring mode works:
            </span>
            <p className="text-blue-800">
              Disabling recurrence means slots selected for a specific date or
              week will only apply to that specific instance and will not
              auto-repeat on future weeks.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saveSettingsMutation.isPending}
          className="flex items-center gap-2 rounded-2xl bg-primaryColorDark px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primaryColorDark/20 hover:bg-[#237c76] transition-all disabled:opacity-50 cursor-pointer"
        >
          <Check size={18} />
          {saveSettingsMutation.isPending
            ? "Saving Settings..."
            : "Save Preferences"}
        </button>
      </div>
    </form>
  );
};

export default SettingsTab;
