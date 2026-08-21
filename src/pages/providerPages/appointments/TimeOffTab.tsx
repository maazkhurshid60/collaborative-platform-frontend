import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";

import Loader from "@/components/loader/Loader";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";
import { availabilityApiService, type TimeOffEntry } from "@/services/availabilityApiService";

interface TimeOffFormState {
    startDate: string;
    endDate: string;
    reason: string;
}

const TimeOffTab = () => {
    const queryClient = useQueryClient();

    const { data: timeOff, isLoading } = useQuery<TimeOffEntry[]>({
        queryKey: ["availability", "time-off"],
        queryFn: async () => {
            const response = await availabilityApiService.getTimeOff();
            return response?.data ?? [];
        },
    });

    const { register, handleSubmit, reset } = useForm<TimeOffFormState>({
        defaultValues: { startDate: "", endDate: "", reason: "" },
    });

    const addMutation = useMutation({
        mutationFn: async (values: TimeOffFormState) =>
            availabilityApiService.addTimeOff({
                startDate: values.startDate,
                endDate: values.endDate,
                reason: values.reason || undefined,
            }),
        onSuccess: () => {
            toast.success("Time off added successfully.");
            queryClient.invalidateQueries({ queryKey: ["availability", "time-off"] });
            reset();
        },
        onError: () => toast.error("Failed to add time off."),
    });

    const removeMutation = useMutation({
        mutationFn: async (timeOffId: string) => availabilityApiService.removeTimeOff(timeOffId),
        onSuccess: () => {
            toast.success("Time off removed successfully.");
            queryClient.invalidateQueries({ queryKey: ["availability", "time-off"] });
        },
        onError: () => toast.error("Failed to remove time off."),
    });

    return (
        <div className="flex flex-col gap-8">
            <form
                onSubmit={handleSubmit((values) => addMutation.mutate(values))}
                className="flex flex-col gap-4 rounded-xl border border-lightGreyColor/25 bg-white p-5 sm:flex-row sm:items-end sm:gap-3"
            >
                <div className="flex-1">
                    <label className="labelMedium mb-1.5 block">Start date</label>
                    <input
                        type="date"
                        required
                        {...register("startDate", { required: true })}
                        className="w-full rounded-lg border border-lightGreyColor/40 px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    />
                </div>
                <div className="flex-1">
                    <label className="labelMedium mb-1.5 block">End date</label>
                    <input
                        type="date"
                        required
                        {...register("endDate", { required: true })}
                        className="w-full rounded-lg border border-lightGreyColor/40 px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    />
                </div>
                <div className="flex-1">
                    <label className="labelMedium mb-1.5 block">Reason (optional)</label>
                    <input
                        type="text"
                        placeholder="Vacation, holiday, etc."
                        {...register("reason")}
                        className="w-full rounded-lg border border-lightGreyColor/40 px-3 py-2.5 text-[14px] text-textColor outline-none focus:border-primaryColorDark"
                    />
                </div>
                <button
                    type="submit"
                    disabled={addMutation.isPending}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-primaryColorDark px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#237c76] disabled:opacity-50 cursor-pointer"
                >
                    <Plus size={16} /> Add
                </button>
            </form>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader />
                </div>
            ) : !timeOff || timeOff.length === 0 ? (
                <NoRecordFound />
            ) : (
                <div className="flex flex-col gap-3">
                    {timeOff.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between rounded-xl border border-lightGreyColor/25 bg-white p-4"
                        >
                            <div>
                                <p className="text-[14px] font-semibold text-textColor">
                                    {new Date(entry.startDate).toLocaleDateString()} —{" "}
                                    {new Date(entry.endDate).toLocaleDateString()}
                                </p>
                                {entry.reason && (
                                    <p className="mt-0.5 text-[13px] text-textGreyColor">{entry.reason}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeMutation.mutate(entry.id)}
                                disabled={removeMutation.isPending}
                                title="Remove"
                                aria-label="Remove time off"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeOffTab;
