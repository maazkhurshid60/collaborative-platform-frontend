import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ArrowRight, Check } from "lucide-react";

import Loader from "@/components/loader/Loader";
import Toggle from "@/components/toggle/Toggle";
import { availabilityApiService } from "@/services/availabilityApiService";
import TimeSelect from "./TimeSelect";
import { US_TIMEZONES } from "./timezones";
import {
    buildDefaultAvailabilityForm,
    DAY_LABELS,
    SESSION_LENGTH_OPTIONS,
    type AvailabilityFormState,
} from "./types";

const AvailabilityTab = () => {
    const queryClient = useQueryClient();

    const { data: weeklyAvailability, isLoading: isLoadingWeekly } = useQuery({
        queryKey: ["availability", "weekly"],
        queryFn: async () => {
            const response = await availabilityApiService.getWeeklyAvailability();
            return response?.data ?? [];
        },
    });

    const { data: bookingSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ["availability", "settings"],
        queryFn: async () => {
            const response = await availabilityApiService.getBookingSettings();
            return response?.data;
        },
    });

    const { register, handleSubmit, reset, watch, control } = useForm<AvailabilityFormState>({
        defaultValues: buildDefaultAvailabilityForm(),
    });

    useEffect(() => {
        if (!weeklyAvailability || !bookingSettings) return;

        const base = buildDefaultAvailabilityForm();
        for (const day of weeklyAvailability) {
            base.days[day.dayOfWeek] = {
                enabled: true,
                dayOfWeek: day.dayOfWeek,
                startTime: day.startTime,
                endTime: day.endTime,
            };
        }
        base.timezone = bookingSettings.timezone ?? "";
        base.appointmentDurationMinutes = bookingSettings.appointmentDurationMinutes ?? 50;
        base.bufferMinutes = bookingSettings.bufferMinutes ?? 0;

        reset(base);
    }, [weeklyAvailability, bookingSettings, reset]);

    const saveMutation = useMutation({
        mutationFn: async (values: AvailabilityFormState) => {
            const enabledDays = values.days
                .filter((d) => d.enabled)
                .map((d) => ({ dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime }));

            await availabilityApiService.setWeeklyAvailability(enabledDays);
            await availabilityApiService.setBookingSettings({
                timezone: values.timezone,
                appointmentDurationMinutes: Number(values.appointmentDurationMinutes),
                bufferMinutes: Number(values.bufferMinutes),
            });
        },
        onSuccess: () => {
            toast.success("Availability saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["availability"] });
        },
        onError: () => toast.error("Failed to save availability."),
    });

    const days = watch("days");

    if (isLoadingWeekly || isLoadingSettings) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader />
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
            className="flex flex-col gap-8"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label className="labelMedium mb-1.5 block">Timezone</label>
                    <select
                        {...register("timezone", { required: true })}
                        className="w-full rounded-lg border border-lightGreyColor/40 bg-white px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    >
                        <option value="" disabled>
                            Select a timezone
                        </option>
                        {US_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="labelMedium mb-1.5 block">Session length</label>
                    <select
                        {...register("appointmentDurationMinutes")}
                        className="w-full rounded-lg border border-lightGreyColor/40 bg-white px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    >
                        {SESSION_LENGTH_OPTIONS.map((minutes) => (
                            <option key={minutes} value={minutes}>
                                {minutes} minutes
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="labelMedium mb-1.5 block">Buffer between sessions</label>
                    <select
                        {...register("bufferMinutes")}
                        className="w-full rounded-lg border border-lightGreyColor/40 bg-white px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    >
                        {[0, 5, 10, 15, 30].map((minutes) => (
                            <option key={minutes} value={minutes}>
                                {minutes === 0 ? "No buffer" : `${minutes} minutes`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <p className="labelMedium">Weekly hours</p>

                {DAY_LABELS.map((label, dayOfWeek) => {
                    const isEnabled = days?.[dayOfWeek]?.enabled;
                    return (
                        <div
                            key={label}
                            className="flex flex-col gap-3 rounded-xl border border-lightGreyColor/25 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3 sm:w-40">
                                <Controller
                                    control={control}
                                    name={`days.${dayOfWeek}.enabled`}
                                    render={({ field }) => (
                                        <Toggle
                                            checked={!!field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    )}
                                />
                                <span className="text-[14px] font-medium text-textColor">{label}</span>
                            </div>

                            {isEnabled ? (
                                <div className="flex flex-wrap items-center gap-2.5 rounded-xl bg-inputBgColor/40 px-3 py-2.5 sm:gap-3.5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold tracking-wide text-lightGreyColor uppercase">
                                            Start
                                        </span>
                                        <Controller
                                            control={control}
                                            name={`days.${dayOfWeek}.startTime`}
                                            render={({ field }) => (
                                                <TimeSelect value={field.value} onChange={field.onChange} />
                                            )}
                                        />
                                    </div>

                                    <ArrowRight size={15} className="mt-4 shrink-0 text-lightGreyColor/60" />

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold tracking-wide text-lightGreyColor uppercase">
                                            End
                                        </span>
                                        <Controller
                                            control={control}
                                            name={`days.${dayOfWeek}.endTime`}
                                            render={({ field }) => (
                                                <TimeSelect value={field.value} onChange={field.onChange} />
                                            )}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[13px] text-lightGreyColor">Unavailable</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-primaryColorDark px-8 py-3 text-[15px] font-bold text-white shadow-lg shadow-primaryColorDark/20 transition-all hover:bg-[#237c76] disabled:opacity-50 cursor-pointer"
                >
                    {saveMutation.isPending ? (
                        "Saving..."
                    ) : (
                        <>
                            <Check size={18} /> Save Availability
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AvailabilityTab;
